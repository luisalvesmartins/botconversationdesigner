// Licensed under the MIT License.

// USING BOT TEMPLATE 4.3 
// DEPLOYMENT INSTRUCTIONS:
// 1. GET FULL NODE PROJECT FROM: https://github.com/luisalvesmartins/botconversationdesigner/tree/master/botcode/csharp
//    OR FROM HERE: https://lambot.blob.core.windows.net/github/botconversationdesigner/samplecsharp.zip
// 2. REPLACE THE FILE DIALOGS/MAIN.CS WITH THIS CONTENT 
// 3. RUN THE BOT
//
// MISSING FEATURES:
// TYPE: card,API,DIALOG,REST CALL,Translation

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Schema;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Extensions.Logging;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.Bot.Builder.AI.Luis;
using Microsoft.Bot.Builder.AI.QnA;
using Microsoft.Bot.Configuration;
using Microsoft.Bot.Builder.Dialogs.Choices;
using System.Net.Http;
using Newtonsoft.Json;
using QnAPrompting.Models;
using Microsoft.Azure.Search;
using Microsoft.Azure.Search.Models;

namespace SampleBot
{
    /// <summary>
    /// Demonstrates the following concepts:
    /// - Use a subclass of ComponentDialog to implement a multi-turn conversation
    /// - Use a Waterflow dialog to model multi-turn conversation flow
    /// - Use custom prompts to validate user input
    /// - Store conversation and user state.
    /// </summary>
    public class MainDialog : ComponentDialog
    {
        public DialogStack dialogStack = new DialogStack();

        public string MAIN_DIALOG = "mainDialog";
        public string NAME_PROMPT = "namePrompt";
        public string CHOICE_PROMPT = "choicePrompt";

        // TEXT STRINGS
        public const string STRING_1 = "# I am the conversation designer demo";
        public const string STRING_2 = "## Read the graphic flow and watch the synchronization between the flow and the chat";
        public const string STRING_3 = "What do you want to try?";
        public const string STRING_9 = "Please shout something. (Exit to leave)";
        public const string STRING_10 = "You said: {SHOUT}";
        public const string STRING_16 = "Chitchat with me in English (EXIT to leave)";
        public const string STRING_20 = "Choose the new language";
        public const string STRING_21 = "Language changed to {CURRENT_LANGUAGE}";
        public const string STRING_24 = "Choose a color using natural language (LUIS)";
        public const string STRING_25 = "Blue: nice color!";
        public const string STRING_26 = "Red: nice color!";
        public const string STRING_27 = "No intent detected";
        public const string STRING_30 = "What to Search?";


        public IStatePropertyAccessor<userState> UserProfileAccessor { get; }
        protected readonly ILogger Logger;

        // Dialog IDs
        /// <summary>
        /// Initializes a new instance of the <see cref="GreetingDialog"/> class.
        /// </summary>
        /// <param name="botServices">Connected services used in processing.</param>
        /// <param name="botState">The <see cref="UserState"/> for storing properties at user-scope.<param>
        /// <param name="loggerFactory">The <see cref="ILoggerFactory"/> that enables logging and tracing.</param>
        public MainDialog(UserState _userState, ILogger<MainDialog> logger)
            : base(nameof(MainDialog))
        {
            Logger = logger;

            // Add control flow dialogs
            AddDialog(new WaterfallDialog(MAIN_DIALOG, new WaterfallStep[]
                                                    {
                                                            MAINSTEP,
                                                            LOOP
                                                    }
                    ));
            AddDialog(new TextPrompt(NAME_PROMPT));
            AddDialog(new ChoicePrompt(CHOICE_PROMPT) { Style = ListStyle.SuggestedAction });

            UserProfileAccessor = _userState.CreateProperty<userState>(nameof(_userState));

        }

        private async Task<DialogTurnResult> MAINSTEP(WaterfallStepContext step, CancellationToken cancellationToken)
        {
            var userProfile = await UserProfileAccessor.GetAsync(step.Context, () => null);
            if (userProfile == null)
            {
                userProfile = new userState() { step = 1, props = new Dictionary<string, string>() };
                await UserProfileAccessor.SetAsync(step.Context, userProfile);
            }
            var stepNumber = userProfile.step;

            switch (stepNumber)
            {
                //STEPS

                case 1:  //START-# I am the conversation designer demo-Main
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_1));
                    return await step.NextAsync();

                case 2:  //MESSAGE-## Read the graphic flow and watch the synchronization between the flow and the chat-Main
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_2));
                    return await step.NextAsync();

                case 3:  //CHOICE-What do you want to try?-Main
                    return await this.STEP_3(step);

                case 4:  //DIALOG-LUIS Dialog-Main
                         //ADD TO THE DIALOG STACK

                    dialogStack.push(new DialogStep { step = 3, dialog = "Main" });
                    return await step.NextAsync();

                case 5:  //DIALOG-Echo Dialog-Main
                         //ADD TO THE DIALOG STACK

                    dialogStack.push(new DialogStep { step = 3, dialog = "Main" });
                    return await step.NextAsync();

                case 6:  //DIALOG-QNA Dialog-Main
                         //ADD TO THE DIALOG STACK

                    dialogStack.push(new DialogStep { step = 3, dialog = "Main" });
                    return await step.NextAsync();

                case 7:  //DIALOG-Change Language Dialog-Main
                         //ADD TO THE DIALOG STACK

                    dialogStack.push(new DialogStep { step = 3, dialog = "Main" });
                    return await step.NextAsync();

                case 8:  //DIALOG-Dialog-Main
                         //ADD TO THE DIALOG STACK

                    dialogStack.push(new DialogStep { step = 3, dialog = "Main" });
                    return await step.NextAsync();

                case 9:  //INPUT-Please shout something. (Exit to leave)-ECHO
                    return await this.STEP_9(step);

                case 10:  //MESSAGE-You said: {SHOUT}-ECHO
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_10));
                    return await step.NextAsync();

                case 11:  //IF-Did user type EXIT ?-ECHO
                    return await step.NextAsync();

                case 12:  //DIALOGSTART-StartDialog-ECHO
                    return await step.NextAsync();

                case 13:  //DIALOGEND-EndDialog-ECHO
                    return await step.NextAsync();

                case 14:  //DIALOGSTART-StartDialog-QnA
                    return await step.NextAsync();

                case 15:  //DIALOGEND-EndDialog-QnA
                    return await step.NextAsync();

                case 16:  //QNA-Chitchat with me in English (EXIT to leave)-QnA
                    return await this.STEP_16(step);

                case 17:  //IF-Did the user type EXIT?-QnA
                    return await step.NextAsync();

                case 18:  //DIALOGSTART-StartDialog-LANGUAGE
                    return await step.NextAsync();

                case 19:  //DIALOGEND-EndDialog-LANGUAGE
                    return await step.NextAsync();

                case 20:  //CHOICE-Choose the new language-LANGUAGE
                    return await this.STEP_20(step);

                case 21:  //MESSAGE-Language changed to {CURRENT_LANGUAGE}-LANGUAGE
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_21));
                    return await step.NextAsync();

                case 22:  //DIALOGSTART-StartDialog-LUIS
                    return await step.NextAsync();

                case 23:  //DIALOGEND-EndDialog-LUIS
                    return await step.NextAsync();

                case 24:  //LUIS-Choose a color using natural language (LUIS)-LUIS
                    return await this.STEP_24(step);

                case 25:  //MESSAGE-Blue: nice color!-LUIS
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_25));
                    return await step.NextAsync();

                case 26:  //MESSAGE-Red: nice color!-LUIS
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_26));
                    return await step.NextAsync();

                case 27:  //MESSAGE-No intent detected-LUIS
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_27));
                    return await step.NextAsync();

                case 28:  //DIALOGSTART-StartDialog-SEARCH
                    return await step.NextAsync();

                case 29:  //DIALOGEND-EndDialog-SEARCH
                    return await step.NextAsync();

                case 30:  //SEARCH-What to Search?-SEARCH
                    return await this.STEP_30(step);

                default:
                    userProfile.step = 1;
                    await UserProfileAccessor.SetAsync(step.Context, userProfile);
                    return await step.NextAsync();
            }

            return await step.NextAsync();
        }

        private async Task<DialogTurnResult> LOOP(WaterfallStepContext step, CancellationToken cancellationToken)
        {
            var userProfile = await UserProfileAccessor.GetAsync(step.Context, () => null);
            var stepResult = getResult(step);
            string expression = "";


            switch (userProfile.step)
            {
                ///MOVENEXT

                case 1:  //START-# I am the conversation designer demo-Main
                    userProfile.step = 2;
                    break;

                case 2:  //MESSAGE-## Read the graphic flow and watch the synchronization between the flow and the chat-Main
                    userProfile.step = 3;
                    break;

                case 3:  //CHOICE-What do you want to try?-Main
                    this.addProp(userProfile, "", stepResult); if (stepResult == await this.ReplacePragmas(step, "LUIS")) userProfile.step = 4;
                    if (stepResult == await this.ReplacePragmas(step, "QnA")) userProfile.step = 6;
                    if (stepResult == await this.ReplacePragmas(step, "Change Language")) userProfile.step = 7;
                    if (stepResult == await this.ReplacePragmas(step, "ECHO")) userProfile.step = 5;
                    if (stepResult == await this.ReplacePragmas(step, "Search")) userProfile.step = 8;

                    break;

                case 4:  //DIALOG-LUIS Dialog-Main
                    userProfile.step = 24;
                    break;

                case 5:  //DIALOG-Echo Dialog-Main
                    userProfile.step = 9;
                    break;

                case 6:  //DIALOG-QNA Dialog-Main
                    userProfile.step = 16;
                    break;

                case 7:  //DIALOG-Change Language Dialog-Main
                    userProfile.step = 20;
                    break;

                case 8:  //DIALOG-Dialog-Main
                    userProfile.step = 30;
                    break;

                case 9:  //INPUT-Please shout something. (Exit to leave)-ECHO
                    if (stepResult != "")
                        this.addProp(userProfile, "SHOUT", stepResult);
                    userProfile.step = 10;
                    break;

                case 10:  //MESSAGE-You said: {SHOUT}-ECHO
                    userProfile.step = 11;
                    break;

                case 11:  //IF-Did user type EXIT ?-ECHO
                    expression = await this.ReplacePragmas(step, "\"{SHOUT}\".toUpperCase()==\"EXIT\"");
                    if (this.evalCondition(expression))
                        userProfile.step = 13;
                    else
                        userProfile.step = 9;
                    break;

                case 12:  //DIALOGSTART-StartDialog-ECHO
                    userProfile.step = 9;
                    break;

                case 13:  //DIALOGEND-EndDialog-ECHO
                          //RESTORE FROM THE DIALOG STACK
                    userProfile.step = dialogStack.pop().step;
                    break;

                case 14:  //DIALOGSTART-StartDialog-QnA
                    userProfile.step = 16;
                    break;

                case 15:  //DIALOGEND-EndDialog-QnA
                          //RESTORE FROM THE DIALOG STACK
                    userProfile.step = dialogStack.pop().step;
                    break;

                case 16:  //QNA-Chitchat with me in English (EXIT to leave)-QnA
                    var qnaResults = await QueryQnAServiceAsync(stepResult, "b8fb0e89-daeb-46f0-9a23-3762df2080a3", "b99d3036-03b3-41c0-98dd-6c90a7aee95c", "https://lambotengineqna.azurewebsites.net/qnamaker");
                    userProfile.step = 17;
                    await qnaResultsDisplay(step, 16, userProfile, qnaResults, cancellationToken);
                    this.addProp(userProfile, "QNA", stepResult);
                    break;

                case 17:  //IF-Did the user type EXIT?-QnA
                    expression = await this.ReplacePragmas(step, "\"{QNA}\".toUpperCase()==\"EXIT\"");
                    if (this.evalCondition(expression))
                        userProfile.step = 15;
                    else
                        userProfile.step = 16;
                    break;

                case 18:  //DIALOGSTART-StartDialog-LANGUAGE
                    userProfile.step = 20;
                    break;

                case 19:  //DIALOGEND-EndDialog-LANGUAGE
                          //RESTORE FROM THE DIALOG STACK
                    userProfile.step = dialogStack.pop().step;
                    break;

                case 20:  //CHOICE-Choose the new language-LANGUAGE
                    this.addProp(userProfile, "CURRENT_LANGUAGE", stepResult); if (stepResult == await this.ReplacePragmas(step, "en-US")) userProfile.step = 21;
                    if (stepResult == await this.ReplacePragmas(step, "fr-FR")) userProfile.step = 21;
                    if (stepResult == await this.ReplacePragmas(step, "pt-PT")) userProfile.step = 21;

                    break;

                case 21:  //MESSAGE-Language changed to {CURRENT_LANGUAGE}-LANGUAGE
                    userProfile.step = 19;
                    break;

                case 22:  //DIALOGSTART-StartDialog-LUIS
                    userProfile.step = 24;
                    break;

                case 23:  //DIALOGEND-EndDialog-LUIS
                          //RESTORE FROM THE DIALOG STACK
                    userProfile.step = dialogStack.pop().step;
                    break;

                case 24:  //LUIS-Choose a color using natural language (LUIS)-LUIS
                    var luisRecognizer = this.LuisRec("914db407-b188-442c-8306-c9cb781faadc", "c6e72331a84c4d23a590c503c360c35b", "https://westus.api.cognitive.microsoft.com");
                    var results = await luisRecognizer.RecognizeAsync(step.Context, new CancellationToken()); var topIntent = LuisRecognizer.TopIntent(results);
                    this.addProp(userProfile, "LUISVAR", stepResult);
                    userProfile.step = 24;
                    if (topIntent == await this.ReplacePragmas(step, "blue_intent")) userProfile.step = 25;
                    if (topIntent == await this.ReplacePragmas(step, "red_intent")) userProfile.step = 26;
                    if (topIntent == await this.ReplacePragmas(step, "none")) userProfile.step = 27;

                    break;

                case 25:  //MESSAGE-Blue: nice color!-LUIS
                    userProfile.step = 23;
                    break;

                case 26:  //MESSAGE-Red: nice color!-LUIS
                    userProfile.step = 23;
                    break;

                case 27:  //MESSAGE-No intent detected-LUIS
                    userProfile.step = 24;
                    break;

                case 28:  //DIALOGSTART-StartDialog-SEARCH
                    userProfile.step = 30;
                    break;

                case 29:  //DIALOGEND-EndDialog-SEARCH
                          //RESTORE FROM THE DIALOG STACK
                    userProfile.step = dialogStack.pop().step;
                    break;

                case 30:  //SEARCH-What to Search?-SEARCH
                    await this.SearchQuery(step, "lambot", "96AA16A0183E6654231FD6B2BA64DEB0", "tags", "Title", "Content", "", stepResult);
                    userProfile.step = 29;
                    this.addProp(userProfile, "SEARCH", stepResult);
                    break;


                default:
                    break;
            }


            await UserProfileAccessor.SetAsync(step.Context, userProfile);
            return await step.ReplaceDialogAsync(MAIN_DIALOG);
        }

        ///FUNCTIONS

        async Task<DialogTurnResult> STEP_3(WaterfallStepContext step) //CHOICE-What do you want to try?-Main
        {
            return await step.PromptAsync(CHOICE_PROMPT, suggestActionsOptions(await this.ReplacePragmas(step, STRING_3), new string[] { await this.ReplacePragmas(step, "LUIS"), await this.ReplacePragmas(step, "QnA"), await this.ReplacePragmas(step, "Change Language"), await this.ReplacePragmas(step, "ECHO"), await this.ReplacePragmas(step, "Search") }));
        }

        async Task<DialogTurnResult> STEP_9(WaterfallStepContext step) //INPUT-Please shout something. (Exit to leave)-ECHO
        {
            ; var text = await this.ReplacePragmas(step, STRING_9);
            var promptoptions = new PromptOptions { Prompt = new Activity { Type = ActivityTypes.Message, Text = text, } };
            return await step.PromptAsync(NAME_PROMPT, promptoptions);
        }

        async Task<DialogTurnResult> STEP_16(WaterfallStepContext step) //QNA-Chitchat with me in English (EXIT to leave)-QnA
        {
            var text = await this.ReplacePragmas(step, STRING_16);
            var promptoptions = new PromptOptions { Prompt = new Activity { Type = ActivityTypes.Message, Text = text, } };
            return await step.PromptAsync(NAME_PROMPT, promptoptions);
        }

        async Task<DialogTurnResult> STEP_20(WaterfallStepContext step) //CHOICE-Choose the new language-LANGUAGE
        {
            return await step.PromptAsync(CHOICE_PROMPT, suggestActionsOptions(await this.ReplacePragmas(step, STRING_20), new string[] { await this.ReplacePragmas(step, "en-US"), await this.ReplacePragmas(step, "fr-FR"), await this.ReplacePragmas(step, "pt-PT") }));
        }

        async Task<DialogTurnResult> STEP_24(WaterfallStepContext step) //LUIS-Choose a color using natural language (LUIS)-LUIS
        {
            var text = await this.ReplacePragmas(step, STRING_24);
            var promptoptions = new PromptOptions { Prompt = new Activity { Type = ActivityTypes.Message, Text = text, } };
            return await step.PromptAsync(NAME_PROMPT, promptoptions);
        }

        async Task<DialogTurnResult> STEP_30(WaterfallStepContext step) //SEARCH-What to Search?-SEARCH
        {
            var text = await this.ReplacePragmas(step, STRING_30);
            var promptoptions = new PromptOptions { Prompt = new Activity { Type = ActivityTypes.Message, Text = text, } };
            return await step.PromptAsync(NAME_PROMPT, promptoptions);
        }


        async Task<string> ReplacePragmas(WaterfallStepContext step, string text)
        {
            var userProfile = await UserProfileAccessor.GetAsync(step.Context, () => null);
            foreach (KeyValuePair<string, string> item in userProfile.props)
            {
                text = text.Replace("{" + item.Key + "}", item.Value);
            }
            return text;
        }

        void addProp(userState userProfile, string key, string value)
        {
            if (userProfile.props.ContainsKey(key))
                userProfile.props[key] = value;
            else
                userProfile.props.Add(key, value);
        }

        string getProp(userState userProfile, string key)
        {
            return userProfile.props[key];
        }

        bool evalCondition(string expression)
        {
            bool Res = false;
            try
            {
                var result = CSharpScript.EvaluateAsync(expression).Result;

                if (result.GetType().Name == "String")
                    Res = true;
                else
                {
                    Res = ((bool)result);
                }
            }
            catch (Exception)
            {
                Res = false;
            }
            return Res;
        }
        LuisRecognizer LuisRec(string applicationId, string endpointKey, string endpoint)
        {
            LuisApplication LA = new LuisApplication(applicationId, endpointKey, endpoint);
            return new LuisRecognizer(LA);
        }
        QnAMaker QnA(string EndpointKey, string KbId, string Hostname)
        {
            QnAMakerService Q = new QnAMakerService();
            Q.EndpointKey = EndpointKey;
            Q.KbId = KbId;
            Q.Hostname = Hostname;
            return new QnAMaker(Q);
        }
        public async Task<QnAResult[]> QueryQnAServiceAsync(string query, string EndpointKey, string KnowledgeBaseId, string Host)
        {
            var requestUrl = $"{Host}/knowledgebases/{KnowledgeBaseId}/generateanswer";
            var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
            var jsonRequest = JsonConvert.SerializeObject(
                new
                {
                    question = query,
                }, Formatting.None);

            request.Headers.Add("Authorization", $"EndpointKey {EndpointKey}");
            request.Content = new StringContent(jsonRequest, System.Text.Encoding.UTF8, "application/json");
            HttpClient _httpClient = new HttpClient();
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var contentString = await response.Content.ReadAsStringAsync();

            var result = JsonConvert.DeserializeObject<QnAResultList>(contentString);

            return result.Answers;
        }
        PromptOptions suggestActionsOptions(string prompt, string[] choices)
        {
            List<Choice> LC = new List<Choice>();
            foreach (var item in choices)
            {
                LC.Add(new Choice(item));
            }
            var opts = new PromptOptions
            {
                Prompt = MessageFactory.Text(prompt),
                Choices = LC
            };

            return opts;
        }
        string getResult(WaterfallStepContext step)
        {
            string stepResult = "";
            try
            {
                stepResult = (string)step.Result;
            }
            catch (Exception)
            {
                stepResult = ((FoundChoice)step.Result).Value;
            }
            return stepResult;
        }
        private async Task qnaResultsDisplay(WaterfallStepContext step, int thisStep, userState userProfile, QnAResult[] qnaResults, CancellationToken cancellationToken)
        {
            if (qnaResults.Length > 0)
            {
                var res = qnaResults[0].Answer;
                var prompts = qnaResults[0].Context?.Prompts;

                if (prompts.Length > 0)
                {
                    var buttons = new List<Choice>();
                    for (int i = 0; i < prompts.Length; i++)
                    {
                        CardAction CA = new CardAction() { Type = ActionTypes.ImBack, Title = prompts[i].DisplayText, Value = prompts[i].DisplayText };
                        buttons.Add(new Choice { Action = CA, Value = prompts[i].DisplayText });
                    }

                    var options = new PromptOptions()
                    {
                        Prompt = MessageFactory.Text(res),
                        Style = ListStyle.HeroCard,
                        Choices = buttons,
                    };

                    await step.PromptAsync(CHOICE_PROMPT, options, cancellationToken);
                    userProfile.step = thisStep;
                }
                else
                {
                    await step.Context.SendActivityAsync(res);
                }
            }
            else
            {
                await step.Context.SendActivityAsync("Sorry, didn't find answers in the KB.");
            }
        }
        public async Task SearchQuery(WaterfallStepContext step, string searchServiceName, string ServiceKey, string indexName, string fieldTitle, string fieldText, string filter ,string searchText)
        {
            SearchServiceClient serviceClient = new SearchServiceClient(searchServiceName, new SearchCredentials(ServiceKey));
            ISearchIndexClient indexClient = serviceClient.Indexes.GetClient(indexName);

            SearchParameters parameters =
                new SearchParameters()
                {
                    //Filter = "Rooms/any(r: r/BaseRate lt 100)",
                    Select = new[] { "*" }
                };

            var results = indexClient.Documents.Search(searchText, parameters);

            List<Attachment> attachments = new List<Attachment>();
            var reply = MessageFactory.Attachment(attachments);
            reply.AttachmentLayout = AttachmentLayoutTypes.Carousel;
            for (int i = 0; i < results.Results.Count; i++)
            {
                HeroCard plCard1 = new HeroCard()
                {
                    Title = results.Results[i].Document[fieldTitle].ToString(),
                    Text = results.Results[i].Document[fieldText].ToString()
                };
                reply.Attachments.Add(plCard1.ToAttachment());
            }

            await step.Context.SendActivityAsync(reply);
        }

    }

    public class userState
    {
        public int step { get; set; }
        public Dictionary<string, string> props;
    }
    public class DialogStack
    {
        List<DialogStep> stack = new List<DialogStep>();
        public void push(DialogStep ob)
        {
            stack.Add(ob);
        }
        public DialogStep pop()
        {
            DialogStep o = stack[stack.Count - 1];
            stack.RemoveAt(stack.Count - 1);
            return o;
        }
    };
    public class DialogStep
    {
        public int step { get; set; }
        public string dialog { get; set; }
    }
}

namespace QnAPrompting.Models
{
    public class QnAResultList
    {
        public QnAResult[] Answers { get; set; }
    }
    public class QnAResult
    {
        public string[] Questions { get; set; }

        public string Answer { get; set; }

        public double Score { get; set; }

        public int Id { get; set; }

        public string Source { get; set; }

        public QnAMetadata[] Metadata { get; }

        public QnAContext Context { get; set; }
    }
    public class QnAMetadata
    {
        public string Name { get; set; }

        public string Value { get; set; }
    }
    public class QnAContext
    {
        public QnAPrompts[] Prompts { get; set; }
    }
    public class QnAPrompts
    {
        public int DisplayOrder { get; set; }

        public int QnaId { get; set; }

        public string DisplayText { get; set; }
    }
}