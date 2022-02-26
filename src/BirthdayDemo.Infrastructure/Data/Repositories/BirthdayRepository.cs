using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using BirthdayDemo.Domain;
using BirthdayDemo.Domain.Repositories.Interfaces;
using BirthdayDemo.Infrastructure.Data.Extensions;
using System.Collections.Generic;
using System;
using Nest;

namespace BirthdayDemo.Infrastructure.Data.Repositories
{
    public class BirthdayRepository : GenericRepository<Birthday, long>, IBirthdayRepository
    {
        private static Uri node = new Uri("https://texttemplate-testing-7087740692.us-east-1.bonsaisearch.net/");
        private static Nest.ConnectionSettings setting = new Nest.ConnectionSettings(node).BasicAuthentication("7303xa0iq9","4cdkz0o14").DefaultIndex("birthdays");
        private static ElasticClient elastic = new ElasticClient(setting);
        public BirthdayRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Birthday> CreateOrUpdateAsync(Birthday birthday)
        {

            await RemoveManyToManyRelationship("BirthdaysCategories", "BirthdaysId", "CategoriesId", birthday.Id, birthday.Categories.Select(x => x.Id).ToList());
            return await base.CreateOrUpdateAsync(birthday);
        }
        public override async Task<JHipsterNet.Core.Pagination.IPage<Birthday>> GetPageAsync(IPageable pageable){
            string query = "";
            ISearchResponse<ElasticBirthday> searchResponse = null;
            if (query == "" || query == "()"){
                searchResponse = await elastic.SearchAsync<ElasticBirthday>(s => s
                    .Size(10000)
                    .Query(q => q
                        .MatchAll()
                    )
                );
            } else {
                searchResponse = await elastic.SearchAsync<ElasticBirthday>(x => x	// use search method
                    .Index("birthdays")
                    .QueryOnQueryString(query)
                    .Size(10000)
                );				// limit to page size
            }
            List<Birthday> content = new List<Birthday>();
            Console.WriteLine(searchResponse.Hits.Count + " hits");
            long Id = 0;
            foreach (var hit in searchResponse.Hits)
            {
                List<Category> listCategory = new List<Category>();
                if (hit.Source.categories != null){
                    hit.Source.categories.ToList().ForEach(c=>{
                        listCategory.Add(new Category{
                            CategoryName = c
                        });
                    });
                }
                content.Add(new Birthday{
                    Id = Id++,
                    Lname = hit.Source.lname,
                    Fname = hit.Source.fname,
                    Dob = hit.Source.dob,
                    Sign = hit.Source.sign,
                    IsAlive = hit.Source.isAlive,
                    Categories = listCategory
                });
            }
            content = content.OrderBy(b => b.Dob).ToList();            
            JHipsterNet.Core.Pagination.Page<Birthday> page = new Page<Birthday>(content, pageable, content.Count);
            return page;
        }
        private class ElasticBirthday
        {
            public string Id { get; set; }
            public string lname { get; set; }
            public string fname { get; set; }
            public DateTime dob{ get; set; }
            public string sign { get; set; }
            public bool isAlive { get; set; }
            public string[] categories {get; set; }
            public string wikipedia {get; set; } 
        }        

    }
    
}
