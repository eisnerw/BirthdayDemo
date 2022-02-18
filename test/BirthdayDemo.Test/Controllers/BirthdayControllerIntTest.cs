using System;

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
    public class BirthdaysControllerIntTest
    {
        public BirthdaysControllerIntTest()
        {
            _factory = new AppWebApplicationFactory<TestStartup>().WithMockUser();
            _client = _factory.CreateClient();

            _birthdayRepository = _factory.GetRequiredService<IBirthdayRepository>();

            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new AutoMapperProfile());
            });
            _mapper = config.CreateMapper();

            InitTest();
        }

        private const string DefaultLname = "AAAAAAAAAA";
        private const string UpdatedLname = "BBBBBBBBBB";

        private const string DefaultFname = "AAAAAAAAAA";
        private const string UpdatedFname = "BBBBBBBBBB";

        private const string DefaultSign = "AAAAAAAAAA";
        private const string UpdatedSign = "BBBBBBBBBB";

        private static readonly DateTime DefaultDob = DateTime.UnixEpoch;
        private static readonly DateTime UpdatedDob = DateTime.Now;

        private static readonly bool? DefaultIsAlive = false;
        private static readonly bool? UpdatedIsAlive = true;

        private readonly AppWebApplicationFactory<TestStartup> _factory;
        private readonly HttpClient _client;
        private readonly IBirthdayRepository _birthdayRepository;

        private Birthday _birthday;

        private readonly IMapper _mapper;

        private Birthday CreateEntity()
        {
            return new Birthday
            {
                Lname = DefaultLname,
                Fname = DefaultFname,
                Sign = DefaultSign,
                Dob = DefaultDob,
                IsAlive = DefaultIsAlive,
            };
        }

        private void InitTest()
        {
            _birthday = CreateEntity();
        }

        [Fact]
        public async Task CreateBirthday()
        {
            var databaseSizeBeforeCreate = await _birthdayRepository.CountAsync();

            // Create the Birthday
            BirthdayDto _birthdayDto = _mapper.Map<BirthdayDto>(_birthday);
            var response = await _client.PostAsync("/api/birthdays", TestUtil.ToJsonContent(_birthdayDto));
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            // Validate the Birthday in the database
            var birthdayList = await _birthdayRepository.GetAllAsync();
            birthdayList.Count().Should().Be(databaseSizeBeforeCreate + 1);
            var testBirthday = birthdayList.Last();
            testBirthday.Lname.Should().Be(DefaultLname);
            testBirthday.Fname.Should().Be(DefaultFname);
            testBirthday.Sign.Should().Be(DefaultSign);
            testBirthday.Dob.Should().Be(DefaultDob);
            testBirthday.IsAlive.Should().Be(DefaultIsAlive);
        }

        [Fact]
        public async Task CreateBirthdayWithExistingId()
        {
            var databaseSizeBeforeCreate = await _birthdayRepository.CountAsync();
            // Create the Birthday with an existing ID
            _birthday.Id = 1L;

            // An entity with an existing ID cannot be created, so this API call must fail
            BirthdayDto _birthdayDto = _mapper.Map<BirthdayDto>(_birthday);
            var response = await _client.PostAsync("/api/birthdays", TestUtil.ToJsonContent(_birthdayDto));

            // Validate the Birthday in the database
            var birthdayList = await _birthdayRepository.GetAllAsync();
            birthdayList.Count().Should().Be(databaseSizeBeforeCreate);
        }

        [Fact]
        public async Task GetAllBirthdays()
        {
            // Initialize the database
            await _birthdayRepository.CreateOrUpdateAsync(_birthday);
            await _birthdayRepository.SaveChangesAsync();

            // Get all the birthdayList
            var response = await _client.GetAsync("/api/birthdays?sort=id,desc");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.[*].id").Should().Contain(_birthday.Id);
            json.SelectTokens("$.[*].lname").Should().Contain(DefaultLname);
            json.SelectTokens("$.[*].fname").Should().Contain(DefaultFname);
            json.SelectTokens("$.[*].sign").Should().Contain(DefaultSign);
            json.SelectTokens("$.[*].dob").Should().Contain(DefaultDob);
            json.SelectTokens("$.[*].isAlive").Should().Contain(DefaultIsAlive);
        }

        [Fact]
        public async Task GetBirthday()
        {
            // Initialize the database
            await _birthdayRepository.CreateOrUpdateAsync(_birthday);
            await _birthdayRepository.SaveChangesAsync();

            // Get the birthday
            var response = await _client.GetAsync($"/api/birthdays/{_birthday.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var json = JToken.Parse(await response.Content.ReadAsStringAsync());
            json.SelectTokens("$.id").Should().Contain(_birthday.Id);
            json.SelectTokens("$.lname").Should().Contain(DefaultLname);
            json.SelectTokens("$.fname").Should().Contain(DefaultFname);
            json.SelectTokens("$.sign").Should().Contain(DefaultSign);
            json.SelectTokens("$.dob").Should().Contain(DefaultDob);
            json.SelectTokens("$.isAlive").Should().Contain(DefaultIsAlive);
        }

        [Fact]
        public async Task GetNonExistingBirthday()
        {
            var maxValue = long.MaxValue;
            var response = await _client.GetAsync("/api/birthdays/" + maxValue);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateBirthday()
        {
            // Initialize the database
            await _birthdayRepository.CreateOrUpdateAsync(_birthday);
            await _birthdayRepository.SaveChangesAsync();
            var databaseSizeBeforeUpdate = await _birthdayRepository.CountAsync();

            // Update the birthday
            var updatedBirthday = await _birthdayRepository.QueryHelper().GetOneAsync(it => it.Id == _birthday.Id);
            // Disconnect from session so that the updates on updatedBirthday are not directly saved in db
            //TODO detach
            updatedBirthday.Lname = UpdatedLname;
            updatedBirthday.Fname = UpdatedFname;
            updatedBirthday.Sign = UpdatedSign;
            updatedBirthday.Dob = UpdatedDob;
            updatedBirthday.IsAlive = UpdatedIsAlive;

            BirthdayDto updatedBirthdayDto = _mapper.Map<BirthdayDto>(updatedBirthday);
            var response = await _client.PutAsync($"/api/birthdays/{_birthday.Id}", TestUtil.ToJsonContent(updatedBirthdayDto));
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the Birthday in the database
            var birthdayList = await _birthdayRepository.GetAllAsync();
            birthdayList.Count().Should().Be(databaseSizeBeforeUpdate);
            var testBirthday = birthdayList.Last();
            testBirthday.Lname.Should().Be(UpdatedLname);
            testBirthday.Fname.Should().Be(UpdatedFname);
            testBirthday.Sign.Should().Be(UpdatedSign);
            testBirthday.Dob.Should().BeCloseTo(UpdatedDob);
            testBirthday.IsAlive.Should().Be(UpdatedIsAlive);
        }

        [Fact]
        public async Task UpdateNonExistingBirthday()
        {
            var databaseSizeBeforeUpdate = await _birthdayRepository.CountAsync();

            // If the entity doesn't have an ID, it will throw BadRequestAlertException
            BirthdayDto _birthdayDto = _mapper.Map<BirthdayDto>(_birthday);
            var response = await _client.PutAsync("/api/birthdays/1", TestUtil.ToJsonContent(_birthdayDto));
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

            // Validate the Birthday in the database
            var birthdayList = await _birthdayRepository.GetAllAsync();
            birthdayList.Count().Should().Be(databaseSizeBeforeUpdate);
        }

        [Fact]
        public async Task DeleteBirthday()
        {
            // Initialize the database
            await _birthdayRepository.CreateOrUpdateAsync(_birthday);
            await _birthdayRepository.SaveChangesAsync();
            var databaseSizeBeforeDelete = await _birthdayRepository.CountAsync();

            var response = await _client.DeleteAsync($"/api/birthdays/{_birthday.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            // Validate the database is empty
            var birthdayList = await _birthdayRepository.GetAllAsync();
            birthdayList.Count().Should().Be(databaseSizeBeforeDelete - 1);
        }

        [Fact]
        public void EqualsVerifier()
        {
            TestUtil.EqualsVerifier(typeof(Birthday));
            var birthday1 = new Birthday
            {
                Id = 1L
            };
            var birthday2 = new Birthday
            {
                Id = birthday1.Id
            };
            birthday1.Should().Be(birthday2);
            birthday2.Id = 2L;
            birthday1.Should().NotBe(birthday2);
            birthday1.Id = 0;
            birthday1.Should().NotBe(birthday2);
        }
    }
}
