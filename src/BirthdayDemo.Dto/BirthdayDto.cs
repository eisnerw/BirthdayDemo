using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace BirthdayDemo.Dto
{

    public class BirthdayDto
    {

        public long Id { get; set; }

        public string Lname { get; set; }
        public string Fname { get; set; }
        public string Sign { get; set; }
        public DateTime Dob { get; set; }
        public bool? IsAlive { get; set; }

        public IList<CategoryDto> Categories { get; set; } = new List<CategoryDto>();


        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}
