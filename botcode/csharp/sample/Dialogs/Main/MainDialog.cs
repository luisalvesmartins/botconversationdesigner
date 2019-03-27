// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// DEPLOYMENT INSTRUCTIONS:
// 1. GET FULL NODE PROJECT FROM: https://github.com/luisalvesmartins/botconversationdesigner/tree/master/botcode/csharp
//    OR FROM HERE: https://lambot.blob.core.windows.net/github/botconversationdesigner/samplecsharp.zip
// 2. REPLACE THE FILE DIALOGS/MAIN.CS WITH THIS CONTENT 
// 3. RUN THE BOT
//
// MISSING FEATURES:
// TYPE: card,API,DIALOG

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

namespace sample
{
    /// 
    /// Demonstrates the following concepts:
    /// - Use a subclass of ComponentDialog to implement a multi-turn conversation
    /// - Use a Waterflow dialog to model multi-turn conversation flow
    /// - Use custom prompts to validate user input
    /// - Store conversation and user state.
    /// 
    public class MainDialog : ComponentDialog
    {
        public string MAIN_DIALOG = "mainDialog";
        public string NAME_PROMPT = "namePrompt";
        public string CHOICE_PROMPT = "choicePrompt";

        // TEXT STRINGS
        public const string STRING_1 = "I am the Echo Bot Sample. Hint: read the flow on the right and try the different paths";
        public const string STRING_2 = "Choice";
        public const string STRING_3 = "Ask A";
        public const string STRING_4 = "Please shout something";
        public const string STRING_5 = "You said: {SHOUT}";
        public const string STRING_6 = "Check if you are saying ECHO";
        public const string STRING_7 = "ECHO... ECHO... ECHO...";
        public const string STRING_8 = "Choose a color using natural language (LUIS)";
        public const string STRING_9 = "Blue: nice color!";
        public const string STRING_10 = "Red: nice color!";
        public const string STRING_11 = "I couldn't figure it out so you can play with QNAMaker";
        public const string STRING_12 = "Chitchat with me (EXIT to leave)";
        public const string STRING_13 = "is EXIT?";
        public const string STRING_14 = "Ask B";



        // Dialog IDs
        /// 
        /// Initializes a new instance of the  class.
        /// 
        /// Connected services used in processing.
        /// The  for storing properties at user-scope.
        /// The  that enables logging and tracing.
        public MainDialog(IStatePropertyAccessor<userState> userProfileStateAccessor, ILoggerFactory loggerFactory)
            : base(nameof(MainDialog))
        {
            UserProfileAccessor = userProfileStateAccessor ?? throw new ArgumentNullException(nameof(userProfileStateAccessor));

            // Add control flow dialogs
            AddDialog(new WaterfallDialog(MAIN_DIALOG, new WaterfallStep[]
                                                    {
                                                            MAINSTEP,
                                                            LOOP
                                                    }
                    ));
            AddDialog(new TextPrompt(NAME_PROMPT));
            AddDialog(new ChoicePrompt(CHOICE_PROMPT) { Style = ListStyle.SuggestedAction });
        }

        public IStatePropertyAccessor<userState> UserProfileAccessor { get; }

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

                case 1:  //START-I am the Echo Bot Sample. Hint: read the flow on the right and try the different paths
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_1));
                    return await step.NextAsync();

                case 2:  //CHOICE-Choice
                    return await this.STEP_2(step);

                case 3:  //INPUT-Ask A
                    return await this.STEP_3(step);

                case 4:  //INPUT-Please shout something
                    return await this.STEP_4(step);

                case 5:  //MESSAGE-You said: {SHOUT}
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_5));
                    return await step.NextAsync();

                case 6:  //IF-Check if you are saying ECHO
                    return await step.NextAsync();

                case 7:  //MESSAGE-ECHO... ECHO... ECHO...
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_7));
                    return await step.NextAsync();

                case 8:  //LUIS-Choose a color using natural language (LUIS)
                    return await this.STEP_8(step);

                case 9:  //MESSAGE-Blue: nice color!
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_9));
                    return await step.NextAsync();

                case 10:  //MESSAGE-Red: nice color!
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_10));
                    return await step.NextAsync();

                case 11:  //MESSAGE-I couldn't figure it out so you can play with QNAMaker
                    await step.Context.SendActivityAsync(await this.ReplacePragmas(step, STRING_11));
                    return await step.NextAsync();

                case 12:  //QNA-Chitchat with me (EXIT to leave)
                    return await this.STEP_12(step);

                case 13:  //IF-is EXIT?
                    return await step.NextAsync();

                case 14:  //INPUT-Ask B
                    return await this.STEP_14(step);

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

                case 1:  //START-I am the Echo Bot Sample. Hint: read the flow on the right and try the different paths
                    userProfile.step = 2;
                    break;

                case 2:  //CHOICE-Choice
                    this.addProp(userProfile, "undefined", stepResult); if (stepResult == await this.ReplacePragmas(step, "A")) userProfile.step = 3;
                    if (stepResult == await this.ReplacePragmas(step, "B")) userProfile.step = 14;

                    break;

                case 3:  //INPUT-Ask A
                    if (stepResult != "")
                        this.addProp(userProfile, "undefined", stepResult);
                    userProfile.step =1;
                    break;

                case 4:  //INPUT-Please shout something
                    if (stepResult != "")
                        this.addProp(userProfile, "SHOUT", stepResult);
                    userProfile.step = 5;
                    break;

                case 5:  //MESSAGE-You said: {SHOUT}
                    userProfile.step = 6;
                    break;

                case 6:  //IF-Check if you are saying ECHO
                    expression = await this.ReplacePragmas(step, "\"{SHOUT}\"==\"ECHO\"");
                    if (this.evalCondition(expression))
                        userProfile.step = 7;
                    else
                        userProfile.step = 4;
                    break;

                case 7:  //MESSAGE-ECHO... ECHO... ECHO...
                    userProfile.step = 8;
                    break;

                case 8:  //LUIS-Choose a color using natural language (LUIS)
                    var luisRecognizer = LuisRec("914db407-b188-442c-8306-c9cb781faadc", "c6e72331a84c4d23a590c503c360c35b", "https://westus.api.cognitive.microsoft.com");
                    var results = await luisRecognizer.RecognizeAsync(step.Context, new CancellationToken()); var topIntent = LuisRecognizer.TopIntent(results);
                    this.addProp(userProfile, "LUISVAR", stepResult);
                    userProfile.step = 8;
                    if (topIntent == await this.ReplacePragmas(step, "blue_intent")) userProfile.step = 9;
                    if (topIntent == await this.ReplacePragmas(step, "red_intent")) userProfile.step = 10;
                    if (topIntent == await this.ReplacePragmas(step, "None")) userProfile.step = 11;

                    break;

                case 9:  //MESSAGE-Blue: nice color!
                    userProfile.step = 4;
                    break;

                case 10:  //MESSAGE-Red: nice color!
                    userProfile.step = 4;
                    break;

                case 11:  //MESSAGE-I couldn't figure it out so you can play with QNAMaker
                    userProfile.step = 12;
                    break;

                case 12:  //QNA-Chitchat with me (EXIT to leave)
                    var qnaMaker = QnA("b8fb0e89-daeb-46f0-9a23-3762df2080a3", "b99d3036-03b3-41c0-98dd-6c90a7aee95c", "https://lambotengineqna.azurewebsites.net/qnamaker");
                    var qnaResults = await qnaMaker.GetAnswersAsync(step.Context); if (qnaResults.Length > 0)
                    {
                        var res = qnaResults[0].Answer;
                        await step.Context.SendActivityAsync(res);
                    }
                    else
                        await step.Context.SendActivityAsync("Sorry, didn't find answers in the KB.");

                    this.addProp(userProfile, "QNA", stepResult);

                    userProfile.step = 13;
                    break;

                case 13:  //IF-is EXIT?
                    expression = await this.ReplacePragmas(step, "\"{QNA}\"==\"EXIT\"");
                    if (this.evalCondition(expression))
                        userProfile.step = 4;
                    else
                        userProfile.step = 12;
                    break;

                case 14:  //INPUT-Ask B
                    if (stepResult != "")
                        this.addProp(userProfile, "undefined", stepResult);
                    userProfile.step = 1;
                    break;


                default:
                    break;
            }


            await UserProfileAccessor.SetAsync(step.Context, userProfile);
            return await step.ReplaceDialogAsync(MAIN_DIALOG);
        }

        ///FUNCTIONS

        async Task<DialogTurnResult> STEP_2(WaterfallStepContext step) //CHOICE-Choice
        {
            return await step.PromptAsync(CHOICE_PROMPT, suggestActionsOptions(await this.ReplacePragmas(step, STRING_2), new string[] { await this.ReplacePragmas(step, "A"), await this.ReplacePragmas(step, "B") }));
        }

        async Task<DialogTurnResult> STEP_3(WaterfallStepContext step) //INPUT-Ask A
        {
            ; var text = await this.ReplacePragmas(step, STRING_3);
            var promptoptions = new PromptOptions { Prompt = new Activity { Type = ActivityTypes.Message, Text = text, } };
            return await step.PromptAsync(NAME_PROMPT, promptoptions);
        }

        async Task<DialogTurnResult> STEP_4(WaterfallStepContext step) //INPUT-Please shout something
        {
            ; var text = await this.ReplacePragmas(step, STRING_4);
            var promptoptions = new PromptOptions { Prompt = new Activity { Type = ActivityTypes.Message, Text = text, } };
            return await step.PromptAsync(NAME_PROMPT, promptoptions);
        }

        async Task<DialogTurnResult> STEP_8(WaterfallStepContext step) //LUIS-Choose a color using natural language (LUIS)
        {
            var text = await this.ReplacePragmas(step, STRING_8);
            var promptoptions = new PromptOptions { Prompt = new Activity { Type = ActivityTypes.Message, Text = text, } };
            return await step.PromptAsync(NAME_PROMPT, promptoptions);
        }

        async Task<DialogTurnResult> STEP_12(WaterfallStepContext step) //QNA-Chitchat with me (EXIT to leave)
        {
            var text = await this.ReplacePragmas(step, STRING_12);
            var promptoptions = new PromptOptions { Prompt = new Activity { Type = ActivityTypes.Message, Text = text, } };
            return await step.PromptAsync(NAME_PROMPT, promptoptions);
        }

        async Task<DialogTurnResult> STEP_14(WaterfallStepContext step) //INPUT-Ask B
        {
            ; var text = await this.ReplacePragmas(step, STRING_14);
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
    }
}