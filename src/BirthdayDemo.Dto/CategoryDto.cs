using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace BirthdayDemo.Dto
{

    public class CategoryDto
    {

        public long Id { get; set; }

        public string CategoryName { get; set; }
        public bool? Selected { get; set; }
        public bool? NotCategorized { get; set; }
        public string FocusType { get; set; }
        public string FocusId { get; set; }
        public string JsonString { get; set; }
        public string Description { get; set; }

        [JsonIgnore]
        public IList<BirthdayDto> Birthdays { get; set; } = new List<BirthdayDto>();


        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}
