using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using BirthdayDemo.Domain.Services.Interfaces;
using BirthdayDemo.Domain.Repositories.Interfaces;
using BirthdayDemo.Dto;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using System;
using Microsoft.EntityFrameworkCore;

namespace BirthdayDemo.Domain.Services
{
    public class CategoryService : ICategoryService
    {
        protected readonly ICategoryRepository _categoryRepository;
        protected readonly ISelectorService _selectorService;
        private readonly IRulesetService _rulesetService;
        private readonly IMapper _mapper;
        protected readonly IBirthdayService _birthdayService;

        public CategoryService(ICategoryRepository categoryRepository, ISelectorService selectorService, IMapper mapper, IBirthdayService birthdayService, IRulesetService rulesetService)
        {
            _categoryRepository = categoryRepository;
            _selectorService = selectorService;
            _mapper = mapper;
            _birthdayService = birthdayService;
            _rulesetService = rulesetService;
        }

        public virtual async Task<Category> Save(Category category)
        {
            await _categoryRepository.CreateOrUpdateAsync(category);
            await _categoryRepository.SaveChangesAsync();
            return category;
        }

        public virtual async Task<IPage<Category>> FindAll(IPageable pageable, string query)
        {
            var page = await _categoryRepository.GetPageFilteredAsync(pageable, query);
            return page;
        }

        public virtual async Task<Category> FindOne(long id)
        {
            var result = await _categoryRepository.QueryHelper()
                .GetOneAsync(category => category.Id == id);
            return result;
        }

        public virtual async Task Delete(long id)
        {
            await _categoryRepository.DeleteByIdAsync(id);
            await _categoryRepository.SaveChangesAsync();
        }
        public virtual async Task<AnalysisResultDto> Analyze(IList<string> ids)
        {
            AnalysisResultDto ret = new AnalysisResultDto();
            Dictionary<string, AnalysisMatchDto> dictMatches= new Dictionary<string, AnalysisMatchDto>();
            AnalysisMatchDto noMatch =  new AnalysisMatchDto{
                title = "Matched no selectors",
                type = AnalysisMatchType.none
            };
            var pageable = JHipsterNet.Core.Pagination.PageableConstants.UnPaged;
            var result = await _selectorService.FindAll(pageable);
            List<SelectorDto> lstSelector = result.Content.Select(entity => _mapper.Map<SelectorDto>(entity)).ToList();
            List<SelectorForMatch> lstSelectorForMatch = new List<SelectorForMatch>();
            for (int i = 0; i < lstSelector.Count; i++){
                SelectorDto s = lstSelector[i];
                Ruleset ruleset = await _rulesetService.FindOneByName(s.RulesetName);
                RulesetOrRule rulesetOrRule = JsonConvert.DeserializeObject<RulesetOrRule>(ruleset.JsonString);
                lstSelectorForMatch.Add(new SelectorForMatch{
                    selectorDto = s,
                    ruleset = rulesetOrRule
                });                
            }
            string error = null;
            int countTries = 0;
            int countMatches = 0;
            for (int i = 0; i < ids.Count; i++){
                List<string> matched = new List<string>();
                Birthday birthday = null;
                try {
                    birthday = await _birthdayService.FindOneWithText(ids[i]);
                } catch (Exception e){
                    error = $"Error doing anaysis {e.Message}";
                }
                if (error == null){
                    lstSelectorForMatch.ForEach(s=>{
                        countTries += 1;
                        if (Evaluate(birthday, s.ruleset)){
                            countMatches += 1;
                            matched.Add(s.selectorDto.Name);
                            if (!dictMatches.Keys.Contains(s.selectorDto.Name)){
                                dictMatches.Add(s.selectorDto.Name, new AnalysisMatchDto{
                                    title = s.selectorDto.Name,
                                    selector = s.selectorDto,
                                    type = AnalysisMatchType.single
                                });
                            }
                            dictMatches[s.selectorDto.Name].ids.Add(birthday.ElasticId);
                        }
                    });
                    if (matched.Count == 0){
                        noMatch.ids.Add(birthday.ElasticId);
                    } else if (matched.Count > 1){
                        matched.Sort();
                        string title = string.Join('`', matched);
                        title = title.Replace("`", matched.Count == 2 ? " & " : ", ");
                        if (!dictMatches.ContainsKey(title)){
                            dictMatches.Add(title, new AnalysisMatchDto{
                                title = title,
                                type = AnalysisMatchType.multiple
                            });
                            dictMatches[title].ids.Add(birthday.ElasticId);
                        }
                    }
                }
            }
            List<string> keys = dictMatches.Keys.ToList();
            keys.Sort();
            keys.ForEach(k=>{
                if (dictMatches[k].type == AnalysisMatchType.single){
                    ret.matches.Add(dictMatches[k]);
                }
            });
            keys.ForEach(k=>{
                if (dictMatches[k].type == AnalysisMatchType.multiple){
                    ret.matches.Add(dictMatches[k]);
                }
            });
            if (noMatch.ids.Count > 0) {
                ret.matches.Add(noMatch);
            }            
            ret.result = error == null ? $"Looked at {ids.Count} documents and got {countMatches} matches out of {countTries} comparisons." : error;
            return ret;
        }

        private bool Evaluate(Birthday birthday, RulesetOrRule set){
            if (set.rules == null){
                string fieldValue = "";
                switch (set.field){
                    case "document":
                        fieldValue = " " + Regex.Replace(birthday.Text, @"<[^>]*>", " ") + " " + birthday.Fname + " " + birthday.Lname + " " + birthday.Sign + " ";
                        break;
                    case "lname":
                        fieldValue = birthday.Lname;
                        break;
                    case "fname":
                        fieldValue = birthday.Fname;
                        break;
                    case "sign":
                        fieldValue = birthday.Sign;
                        break;
                }
                switch (set.@operator){
                    case "=":
                        return fieldValue.ToLower() == ((string)set.value).ToLower();
                    case "!=":
                        return fieldValue.ToLower() != ((string)set.value).ToLower();
                    case "exists":
                        bool fieldValueExists = fieldValue != null && fieldValue.ToString().Length > 0;
                        return (set.value != null && ((string)set.value) == "true") ? fieldValueExists : !fieldValueExists;                  
                    case "contains":
                        string reString = "";
                        if (((string)set.value).StartsWith("\"") && ((string)set.value).EndsWith("\"")){
                            string unquoted = ((string)set.value).Substring(1, ((string)set.value).Length -2);
                            reString = Regex.Replace(unquoted, @"[^A-Z\d]+", @"[^A-Z\d]+",RegexOptions.IgnoreCase);
                        } else {
                            reString =  @"[^A-Z\d]+" + set.value +  @"[^A-Z\d]+";
                        }
                        if (Regex.IsMatch(fieldValue, reString,RegexOptions.IgnoreCase)){
                            return true;
                        }
                        break;
                    case "in":
                    case "not in":
                        List<string> lstValue = JsonConvert.DeserializeObject<List<string>>(set.value.ToString());
                        bool bMatch = false;
                        lstValue.ForEach(v=>{
                            if (fieldValue.ToLower() == v.ToLower()){
                                bMatch = true;
                            }
                        });
                        if ((set.@operator == "in" && bMatch) || (set.@operator == "not in" && !bMatch)){
                            return true;
                        }
                        break;
                }
                return false;
            } else {
                bool evaluation = set.condition == "and" ? true : false;
                for (int i = 0; i < set.rules.Count; i++){
                    if (evaluation && set.condition == "and" & !Evaluate(birthday, set.rules[i])){
                        evaluation = false;
                        break;
                    } else if (set.condition == "or") {
                        if (Evaluate(birthday, set.rules[i])){
                            evaluation = true;
                            break;
                        }
                    }
                }
                return set.not ? !evaluation : evaluation;
            }
        }
    }

    public class SelectorForMatch{
        public SelectorDto selectorDto { get; set; }
        public RulesetOrRule ruleset { get; set; }
    }    
}
