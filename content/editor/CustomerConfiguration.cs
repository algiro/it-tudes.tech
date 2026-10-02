namespace Crm.Data;

internal sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(c => c.VatNumber)
            .HasMaxLength(⟨16|20⟩);

        builder.OwnsOne(c => c.Address, address =>
        {
            address.Property(a => a.Country).HasMaxLength(2);
            address.Property(a => a.PostalCode).HasMaxLength(12);
        });

        builder.HasMany(c => c.Invoices)
            .WithOne()
            .HasForeignKey(i => i.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
