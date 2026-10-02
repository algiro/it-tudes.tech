var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var invoicesDb = postgres.AddDatabase("invoices");

var cache = builder.AddRedis("cache");

var api = builder.AddProject<Projects.Billing_Api>("api")
    .WithReference(invoicesDb)
    .WithReference(cache)
    .WaitFor(⟨postgres|invoicesDb⟩);

builder.AddNpmApp("web", "../billing-web")
    .WithReference(api)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
