﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Thinkgate.Portal.ParentStudent.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class ClientSuppliedIdEntities : DbContext
    {
        public ClientSuppliedIdEntities()
            : base("name=ClientSuppliedIdEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<ClientSuppliedIdentification> ClientSuppliedIdentifications { get; set; }
        public virtual DbSet<ClientSuppliedIdentification_LEA_Xref> ClientSuppliedIdentification_LEA_Xref { get; set; }
    }
}