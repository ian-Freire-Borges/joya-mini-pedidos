using Microsoft.EntityFrameworkCore;
namespace Pedidos.Api;

public sealed class PedidosDb(DbContextOptions<PedidosDb> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<ItemPedido> ItensPedido => Set<ItemPedido>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Cliente>().ToTable("Clientes").Property(x => x.Nome).HasMaxLength(160).IsRequired();
        b.Entity<Produto>().ToTable("Produtos").Property(x => x.Nome).HasMaxLength(160).IsRequired();
        b.Entity<Produto>().Property(x => x.Preco).HasPrecision(18, 2);
        b.Entity<Pedido>().ToTable("Pedidos");
        b.Entity<Pedido>().Property(x => x.DataPedido).HasColumnType("datetime2(7)").HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        b.Entity<Pedido>().HasOne(x => x.Cliente).WithMany().HasForeignKey(x => x.ClienteId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Pedido>().HasMany(x => x.Itens).WithOne().HasForeignKey(x => x.PedidoId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<ItemPedido>().ToTable("ItensPedido").HasKey(x => new { x.PedidoId, x.ProdutoId });
        b.Entity<ItemPedido>().Property(x => x.PrecoUnitario).HasPrecision(18, 2);
        b.Entity<ItemPedido>().HasOne(x => x.Produto).WithMany().HasForeignKey(x => x.ProdutoId).OnDelete(DeleteBehavior.Restrict);
    }
}
