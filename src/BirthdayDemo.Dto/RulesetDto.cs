using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BirthdayDemo.Dto
{

    public class RulesetDto
    {

        public long Id { get; set; }

        public string Name { get; set; }
        public string JsonString { get; set; }
        public Boolean bDelete { get; set; }

        // jhipster-needle-dto-add-field - JHipster will add fields here, do not remove
    }
}
