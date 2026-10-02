namespace Shop.Api.Orders;

public static class OrderEndpoints
{
    public static RouteGroupBuilder MapOrders(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/orders")
            .WithTags("Orders")
            .RequireAuthorization();

        group.MapGet("/{id:guid}", GetById);
        group.MapPost("/", Create);
        return group;
    }

    static async Task<Results<Ok<OrderDto>, NotFound>> GetById(
        Guid id, ShopDb db, CancellationToken ct)
    {
        var order = await db.Orders
            .AsNoTracking()
            .⟨First|FirstOrDefault|later⟩Async(o => o.Id == id, ct);

        return order is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(order.ToDto());
    }

    static async Task<Created<OrderDto>> Create(
        CreateOrder request, ShopDb db, CancellationToken ct)
    {
        var order = Order.Place(request.CustomerId, request.Lines);
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        return TypedResults.Created($"/orders/{order.Id}", order.ToDto());
    }
}
