using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Globalization;
using Backend.Models;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS
var allowOrigin = Environment.GetEnvironmentVariable("ALLOW_ORIGIN")
                  ?? builder.Configuration["Cors:Origins:0"]
                  ?? "http://localhost:4200";
builder.Services.AddCors(o => o.AddPolicy("any",
    p => p.WithOrigins(allowOrigin).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

// DI
builder.Services.AddSingleton<DataService>();
builder.Services.AddHttpClient<MlClient>(c =>
{
    var baseUrl = Environment.GetEnvironmentVariable("ML_SERVICE_URL") ?? "http://localhost:8000";
    c.BaseAddress = new Uri(baseUrl);
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors("any");
app.UseSwagger();
app.UseSwaggerUI();

// Health
app.MapGet("/health", () => Results.Ok(new { ok = true }));

// 1) Upload
app.MapPost("/dataset/upload", async (HttpRequest req, DataService data, CancellationToken ct) =>
{
    if (!req.HasFormContentType) return Results.BadRequest("multipart/form-data required with field 'file'");
    var file = req.Form.Files.GetFile("file");
    if (file is null) return Results.BadRequest("file field missing");
    var meta = await data.SaveUploadedDatasetAsync(file, ct);
    return Results.Ok(meta);
});

// 2) Validate date ranges
app.MapPost("/dates/validate", (DateRanges body, DataService data) =>
{
    if (!(body.TrainStart <= body.TrainEnd && body.TestStart <= body.TestEnd && body.SimStart <= body.SimEnd))
        return Results.Ok(new DateValidationResult { Status="Invalid", Message="Start must be <= End for all ranges." });
    if (!(body.TrainEnd <= body.TestStart && body.TestEnd <= body.SimStart))
        return Results.Ok(new DateValidationResult { Status="Invalid", Message="Ranges must be sequential: Train <= Test <= Sim." });

    var train = data.CountRows(body.TrainStart, body.TrainEnd);
    var test  = data.CountRows(body.TestStart,  body.TestEnd);
    var sim   = data.CountRows(body.SimStart,   body.SimEnd);

    return Results.Ok(new DateValidationResult {
        Status = "Valid",
        Counts = new { train, test, sim },
        Durations = new {
            trainDays = (body.TrainEnd - body.TrainStart).TotalDays,
            testDays  = (body.TestEnd  - body.TestStart ).TotalDays,
            simDays   = (body.SimEnd   - body.SimStart  ).TotalDays
        },
        Monthly = data.MonthlyBuckets(body)
    });
});

// 3) Train (direct pass-through to ML /train; avoids DTO/null mismatches)
app.MapPost("/train-model", async (HttpContext http) =>
{
    // read incoming JSON as-is
    using var reader = new StreamReader(http.Request.Body);
    var bodyJson = await reader.ReadToEndAsync();

    // ML base URL
    var mlUrl = Environment.GetEnvironmentVariable("ML_SERVICE_URL") ?? "http://127.0.0.1:8000";

    using var client = new HttpClient();
    var req = new HttpRequestMessage(HttpMethod.Post, $"{mlUrl}/train")
    {
        Content = new StringContent(bodyJson, System.Text.Encoding.UTF8, "application/json")
    };

    var resp = await client.SendAsync(req);
    var mlJson = await resp.Content.ReadAsStringAsync();

    http.Response.ContentType = "application/json";
    http.Response.StatusCode = (int)resp.StatusCode;
    await http.Response.WriteAsync(mlJson);
});


// 4) Simulation SSE (1 event/sec)
app.MapGet("/simulate/stream", async (HttpContext ctx, DataService data, MlClient ml, DateTime simStart, DateTime simEnd, CancellationToken ct) =>
{
    ctx.Response.Headers.Append("Content-Type", "text/event-stream");
    ctx.Response.Headers.Append("Cache-Control", "no-cache");

    var totals = new Totals();
    foreach (var row in data.EnumerateRows(simStart, simEnd))
    {
        var features = row.Where(kv => kv.Key != "Response" && kv.Key != "synthetic_timestamp")
                          .ToDictionary(kv => kv.Key, kv => ParseValue(kv.Value));

        var pred = await ml.PredictAsync(features, ct);

        totals.N++; if (pred.Pred == 1) totals.Pass++; else totals.Fail++;
        totals.AvgConf = ((totals.AvgConf * (totals.N - 1)) + pred.Prob) / totals.N;

        var ts = DateTime.TryParse(row.GetValueOrDefault("synthetic_timestamp"), out var tsv) ? tsv : DateTime.UtcNow;
        long.TryParse(row.GetValueOrDefault("id"), out var id);

        var evt = new SimEvent {
            Ts = ts, Id = id==0 ? totals.N : id, Pred = pred.Pred, Conf = pred.Prob,
            Telemetry = new Dictionary<string, object> {
                { "temperature", ParseValue(row.GetValueOrDefault("temperature")) ?? "" },
                { "pressure",    ParseValue(row.GetValueOrDefault("pressure"))    ?? "" },
                { "humidity",    ParseValue(row.GetValueOrDefault("humidity"))    ?? "" }
            },
            Totals = totals
        };

        var json = JsonSerializer.Serialize(evt);
        await ctx.Response.WriteAsync($"data: {json}\n\n", ct);
        await ctx.Response.Body.FlushAsync(ct);
        await Task.Delay(1000, ct);
    }

    var done = JsonSerializer.Serialize(new { done = true, totals });
    await ctx.Response.WriteAsync($"data: {done}\n\n", ct);
    await ctx.Response.Body.FlushAsync(ct);
});

app.Run();

static object? ParseValue(string? s)
{
    if (string.IsNullOrWhiteSpace(s)) return null;
    if (double.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var d)) return d;
    if (long.TryParse(s, out var l)) return l;
    return s;
}
