
using AutoMapper;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using BirthdayDemo.Infrastructure.Data;
using BirthdayDemo.Domain;
using BirthdayDemo.Domain.Repositories.Interfaces;
using BirthdayDemo.Dto;
using BirthdayDemo.Configuration.AutoMapper;
using BirthdayDemo.Test.Setup;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using Xunit;

namespace BirthdayDemo.Test.Controllers
{
    public class CategoriesControllerIntTest
    {
        public CategoriesControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _categoryRepository = _factory.GetRequiredService<ICategoryRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultCategoryName = "AAAAAAAAAA";
        private const string UpdatedCategoryName = "BBBBBBBBBB";

        private static readonly bool? DefaultSelected = false;
        private static readonly bool? UpdatedSelected = true;

        private static readonly bool? DefaultNotCategorized = false;
        private static readonly bool? UpdatedNotCategorized = true;

        private const FocusType DefaultFocusType = FocusType.NONE;
        private const FocusType UpdatedFocusType = FocusType.REFERENCESFROM;

        private const string DefaultFocusId = "AAAAAAAAAA";
        private const string UpdatedFocusId = "BBBBBBBBBB";

        private const string DefaultJsonString = "AAAAAAAAAA";
        private const string UpdatedJsonString = "BBBBBBBBBB";

        private const string DefaultDescription = "AAAAAAAAAA";
        private const string UpdatedDescription = "BBBBBBBBBB";

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly ICategoryRepository _categoryRepository;

        private Category _category;

        private readonly IMapper _mapper;

        private Category CreateEntity()
        {
            return new Category
            {
                CategoryName = DefaultCategoryName,
                selected = DefaultSelected,
                notCategorized = DefaultNotCategorized,
                focusType = DefaultFocusType,
                focusId = DefaultFocusId,
                jsonString = DefaultJsonString,
                description = DefaultDescription,
            };
        }

        private void InitTest()
        {
            _category = CreateEntity();
        }

        [Fact]
        public async Task CreateCategory()
        {
            var databaseSizeBeforeCreate = await _categoryRepository.CountAsync();

            // Create the Category
            CategoryDto _categoryDto = _mapper.Map<CategoryDto>(_category);
            var response = await _client.PostAsync("/api/categories", TestUtil.ToJsonContent(_categoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the Category in the database
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testCategory = categoryList.Last();
            testCategory.CategoryName.Should().Be(DefaultCategoryName);
            testCategory.selected.Should().Be(DefaultSelected);
            testCategory.notCategorized.Should().Be(DefaultNotCategorized);
            testCategory.focusType.Should().Be(DefaultFocusType);
            testCategory.focusId.Should().Be(DefaultFocusId);
            testCategory.jsonString.Should().Be(DefaultJsonString);
            testCategory.description.Should().Be(DefaultDescription);
        }

        [Fact]
        public async Task CreateCategoryWithExistingId()
        {
            var databaseSizeBeforeCreate = await _categoryRepository.CountAsync();
            // Create the Category with an existing ID
            _category.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            CategoryDto _categoryDto = _mapper.Map<CategoryDto>(_category);
            var response = await _client.PostAsync("/api/categories", TestUtil.ToJsonContent(_categoryDto));

            // Validate the Category in the database
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllCategories()
        {
            // Initialize the database
            await _categoryRepository.CreateOrUpdateAsync(_category);
            await _categoryRepository.SaveChangesAsync();

            // Get all the categoryList
            var response = await _client.GetAsync("/api/categories?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_category.Id);
            json.SelectTokens("$.[*].categoryName").Should().Contain(DefaultCategoryName);
            json.SelectTokens("$.[*].selected").Should().Contain(DefaultSelected);
            json.SelectTokens("$.[*].notCategorized").Should().Contain(DefaultNotCategorized);
            // json.SelectTokens("$.[*].focusType").Should().Contain(DefaultFocusType);
            json.SelectTokens("$.[*].focusId").Should().Contain(DefaultFocusId);
            json.SelectTokens("$.[*].jsonString").Should().Contain(DefaultJsonString);
            json.SelectTokens("$.[*].description").Should().Contain(DefaultDescription);
        }

        [Fact]
        public async Task GetCategory()
        {
            // Initialize the database
            await _categoryRepository.CreateOrUpdateAsync(_category);
            await _categoryRepository.SaveChangesAsync();

            // Get the category
            var response = await _client.GetAsync($"/api/categories/{_category.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_category.Id);
            json.SelectTokens("$.categoryName").Should().Contain(DefaultCategoryName);
            json.SelectTokens("$.selected").Should().Contain(DefaultSelected);
            json.SelectTokens("$.notCategorized").Should().Contain(DefaultNotCategorized);
            // json.SelectTokens("$.focusType").Should().Contain(DefaultFocusType);
            json.SelectTokens("$.focusId").Should().Contain(DefaultFocusId);
            json.SelectTokens("$.jsonString").Should().Contain(DefaultJsonString);
            json.SelectTokens("$.description").Should().Contain(DefaultDescription);
        }

        [Fact]
        public async Task GetNonExistingCategory()
        {
            var maxValue = long.MaxValue;
            var response = await _client.GetAsync("/api/categories/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateCategory()
        {
            // Initialize the database
            await _categoryRepository.CreateOrUpdateAsync(_category);
            await _categoryRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _categoryRepository.CountAsync();

            // Update the category
            var updatedCategory = await _categoryRepository.QueryHelper().GetOneAsync(it => it.Id == _category.Id);
            // Disconnect from session so that the updates on updatedCategory are not directly saved in db
            //TODO detach
            updatedCategory.CategoryName = UpdatedCategoryName;
            updatedCategory.selected = UpdatedSelected;
            updatedCategory.notCategorized = UpdatedNotCategorized;
            updatedCategory.focusType = UpdatedFocusType;
            updatedCategory.focusId = UpdatedFocusId;
            updatedCategory.jsonString = UpdatedJsonString;
            updatedCategory.description = UpdatedDescription;

            CategoryDto updatedCategoryDto = _mapper.Map<CategoryDto>(updatedCategory);
            var response = await _client.PutAsync($"/api/categories/{_category.Id}", TestUtil.ToJsonContent(updatedCategoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the Category in the database
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testCategory = categoryList.Last();
            testCategory.CategoryName.Should().Be(UpdatedCategoryName);
            testCategory.selected.Should().Be(UpdatedSelected);
            testCategory.notCategorized.Should().Be(UpdatedNotCategorized);
            testCategory.focusType.Should().Be(UpdatedFocusType);
            testCategory.focusId.Should().Be(UpdatedFocusId);
            testCategory.jsonString.Should().Be(UpdatedJsonString);
            testCategory.description.Should().Be(UpdatedDescription);
        }

        [Fact]
        public async Task UpdateNonExistingCategory()
        {
            var databaseSizeBeforeUpdate = await _categoryRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            CategoryDto _categoryDto = _mapper.Map<CategoryDto>(_category);
            var response = await _client.PutAsync("/api/categories/1", TestUtil.ToJsonContent(_categoryDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the Category in the database
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteCategory()
        {
            // Initialize the database
            await _categoryRepository.CreateOrUpdateAsync(_category);
            await _categoryRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _categoryRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/categories/{_category.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the database is empty
            var categoryList = await _categoryRepository.GetAllAsync();
            categoryList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(Category));
            var category1 = new Category
            {
                Id = 1L
            };
            var category2 = new Category
            {
                Id = category1.Id
            };
            category1.Should().Be(category2);
            category2.Id = 2L;
            category1.Should().NotBe(category2);
            category1.Id = 0;
            category1.Should().NotBe(category2);
        }
    }
}
