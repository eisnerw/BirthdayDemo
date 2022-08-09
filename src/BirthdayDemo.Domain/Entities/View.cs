    using System.Collections.Generic;
    using BirthdayDemo.Domain;

    namespace BirthdayDemo.Domain
    {
        public class View<T>
        {
            public string query { get; set; }
            public string aggregation { get; set; }
            public string script { get; set; }
            public string categoryQuery { get; set; }
            public string field { get; set; }
            public List<T> focus { get; set; }
            public View<T> topLevelView { get; set; }
            public string topLevelCategory { get; set; }
        }
    }