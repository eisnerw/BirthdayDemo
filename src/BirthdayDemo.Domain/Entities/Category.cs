using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace BirthdayDemo.Domain
{
    [Table("category")]
    public class Category : BaseEntity<long>
    {
        public string CategoryName { get; set; }
        public bool? Selected { get; set; }
        public bool? NotCategorized { get; set; }
        public string FocusType { get; set; }
        public string FocusId { get; set; }
        public string JsonString { get; set; }
        public string Description { get; set; }
        [JsonIgnore]
        public IList<Birthday> Birthdays { get; set; } = new List<Birthday>();

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;
            var category = obj as Category;
            if (category?.Id == null || category?.Id == 0 || Id == 0) return false;
            return EqualityComparer<long>.Default.Equals(Id, category.Id);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id);
        }

        public override string ToString()
        {
            return "Category{" +
                    $"ID='{Id}'" +
                    $", CategoryName='{CategoryName}'" +
                    $", Selected='{Selected}'" +
                    $", NotCategorized='{NotCategorized}'" +
                    $", FocusType='{FocusType}'" +
                    $", FocusId='{FocusId}'" +
                    $", JsonString='{JsonString}'" +
                    $", Description='{Description}'" +
                    "}";
        }
    }
}
