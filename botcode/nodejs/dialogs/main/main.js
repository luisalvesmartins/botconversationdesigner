// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// DEPLOYMENT INSTRUCTIONS:
// 1. GET FULL NODE PROJECT FROM: https://github.com/luisalvesmartins/botconversationdesigner/tree/master/botcode/nodejs
//    OR FROM HERE: https://lambot.blob.core.windows.net/github/botconversationdesigner/samplenodejs.zip
// 2. REPLACE THE FILE DIALOGS/MAIN.JS WITH THIS CONTENT 
// 3. RUN THE BOT
//
// MISSING FEATURES:
// TYPE: API,DIALOG

// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt, ChoicePrompt } = require('botbuilder-dialogs');
const { MessageFactory, CardFactory } = require('botbuilder');
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');

// Dialog IDs
const MAIN_DIALOG = 'mainDialog';

// Prompt IDs
const NAME_PROMPT = 'namePrompt';
const CHOICE_PROMPT = 'choicePrompt';

// TEXT STRINGS
const STRING_1="I am the Echo Bot Sample. Hint: read the flow on the right and try the different paths";
const STRING_2="Choice";
const STRING_3="Ask A";
const STRING_4="Please shout something";
const STRING_5="You said: {SHOUT}";
const STRING_6="Check if you are saying ECHO";
const STRING_7="ECHO... ECHO... ECHO...";
const STRING_8="Choose a color using natural language (LUIS)";
const STRING_9="Blue: nice color!";
const STRING_10="Red: nice color!";
const STRING_11="I couldn't figure it out so you can play with QNAMaker";
const STRING_12="Chitchat with me (EXIT to leave)";
const STRING_13="is EXIT?";
const STRING_14="Ask B";


/**
 * @param {String} dialogId unique identifier for this dialog instance
 * @param {PropertyStateAccessor} userProfileAccessor property accessor for user state
 */
class Main extends ComponentDialog {
    constructor(dialogId, userProfileAccessor) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        if (!userProfileAccessor) throw new Error('Missing parameter.  userProfileAccessor is required');

        // Add a water fall dialog with 4 steps.
        // The order of step function registration is important
        // as a water fall dialog executes steps registered in order
        this.addDialog(new WaterfallDialog("MAIN_DIALOG", [
            this.MAINSTEP.bind(this),
            this.LOOP.bind(this)
        ]));

        // Add text prompts for name and city
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        // Save off our state accessor for later use
        this.userProfileAccessor = userProfileAccessor;
    }

async MAINSTEP(step){
    let userProfile = await this.userProfileAccessor.get(step.context);
    if (userProfile === undefined) {
        userProfile = {step:1};
    }

    var stepNumber=userProfile.step;
    //SAVE step
    await this.userProfileAccessor.set(step.context, userProfile);

    switch (stepNumber) {
//STEPS

          case 1:  //START-I am the Echo Bot Sample. Hint: read the flow on the right and try the different paths
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_1) );
              return await step.next();

          case 2:  //CHOICE-Choice
   return await this.STEP_2(step);

          case 3:  //INPUT-Ask A
   return await this.STEP_3(step);

          case 4:  //INPUT-Please shout something
   return await this.STEP_4(step);

          case 5:  //MESSAGE-You said: {SHOUT}
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_5) );
              return await step.next();

          case 6:  //IF-Check if you are saying ECHO
return await step.next();

          case 7:  //MESSAGE-ECHO... ECHO... ECHO...
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_7) );
              return await step.next();

          case 8:  //LUIS-Choose a color using natural language (LUIS)
   return await this.STEP_8(step);

          case 9:  //MESSAGE-Blue: nice color!
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_9) );
              return await step.next();

          case 10:  //MESSAGE-Red: nice color!
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_10) );
              return await step.next();

          case 11:  //MESSAGE-I couldn't figure it out so you can play with QNAMaker
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_11) );
              return await step.next();

          case 12:  //QNA-Chitchat with me (EXIT to leave)
   return await this.STEP_12(step);

          case 13:  //IF-is EXIT?
return await step.next();

          case 14:  //INPUT-Ask B
   return await this.STEP_14(step);
    
            default:
                console.log("ERROR");
                userProfile = {step:1};
                await this.userProfileAccessor.set(step.context, userProfile);
                return await step.next();
                break;
        }
    }

    async LOOP(step){
        let userProfile = await this.userProfileAccessor.get(step.context);
        var stepResult = step.result;
        userProfile.result=step.result;
        var expression="";

        switch (userProfile.step) {
///MOVENEXT

            case 1:  //START-I am the Echo Bot Sample. Hint: read the flow on the right and try the different paths
userProfile.step=2;
            break;

            case 2:  //CHOICE-Choice
this.addProp(userProfile,"undefined",stepResult);            if (stepResult==await this.ReplacePragmas(step,"A")) userProfile.step=3;
if (stepResult==await this.ReplacePragmas(step,"B")) userProfile.step=14;

            break;

            case 3:  //INPUT-Ask A
if (stepResult!="")
              this.addProp(userProfile,"undefined",stepResult);
              userProfile.step="ERROR";
            break;

            case 4:  //INPUT-Please shout something
if (stepResult!="")
              this.addProp(userProfile,"SHOUT",stepResult);
              userProfile.step=5;
            break;

            case 5:  //MESSAGE-You said: {SHOUT}
userProfile.step=6;
            break;

            case 6:  //IF-Check if you are saying ECHO
expression=await this.ReplacePragmas(step, "\"{SHOUT}\"==\"ECHO\"");
            if (this.evalCondition(expression))
              userProfile.step=7;
            else
              userProfile.step=4;
            break;

            case 7:  //MESSAGE-ECHO... ECHO... ECHO...
userProfile.step=8;
            break;

            case 8:  //LUIS-Choose a color using natural language (LUIS)
var luisRecognizer=LuisRec("914db407-b188-442c-8306-c9cb781faadc","c6e72331a84c4d23a590c503c360c35b","https://westus.api.cognitive.microsoft.com");
            var results = await luisRecognizer.recognize(step.context);var topIntent = LuisRecognizer.topIntent(results);
            this.addProp(userProfile,"LUISVAR",stepResult);
            userProfile.step=8;
if (topIntent==await this.ReplacePragmas(step,"blue_intent")) userProfile.step=9;
if (topIntent==await this.ReplacePragmas(step,"red_intent")) userProfile.step=10;
if (topIntent==await this.ReplacePragmas(step,"None")) userProfile.step=11;

          break;

            case 9:  //MESSAGE-Blue: nice color!
userProfile.step=4;
            break;

            case 10:  //MESSAGE-Red: nice color!
userProfile.step=4;
            break;

            case 11:  //MESSAGE-I couldn't figure it out so you can play with QNAMaker
userProfile.step=12;
            break;

            case 12:  //QNA-Chitchat with me (EXIT to leave)
var qnaMaker=QnA("b8fb0e89-daeb-46f0-9a23-3762df2080a3", "b99d3036-03b3-41c0-98dd-6c90a7aee95c", "https://lambotengineqna.azurewebsites.net/qnamaker");
        var qnaResults = await qnaMaker.generateAnswer(stepResult, 1, 0.1); if (qnaResults[0]) {var res=qnaResults[0].answer;
            await step.context.sendActivity(res);
          }
          else
            await step.context.sendActivity("Sorry, didn't find answers in the KB.");

          this.addProp(userProfile,"QNA",stepResult);

          userProfile.step=13;
          break;

            case 13:  //IF-is EXIT?
expression=await this.ReplacePragmas(step, "\"{QNA}\"==\"EXIT\"");
            if (this.evalCondition(expression))
              userProfile.step=4;
            else
              userProfile.step=12;
            break;

            case 14:  //INPUT-Ask B
if (stepResult!="")
              this.addProp(userProfile,"undefined",stepResult);
              userProfile.step="ERROR";
            break;
            
       
            default:
                break;
        }
        await this.userProfileAccessor.set(step.context, userProfile);


        return await step.replaceDialog(MAIN_DIALOG);
    }
///FUNCTIONS

async STEP_2(step) //CHOICE-Choice
          {
            return await step.prompt(NAME_PROMPT,this.suggestActionsOptions(await this.ReplacePragmas(step,STRING_2), [await this.ReplacePragmas(step,"A"),await this.ReplacePragmas(step,"B")]));
          }

async STEP_3(step) //INPUT-Ask A
            {
;var text=await this.ReplacePragmas(step,STRING_3);
var promptoptions=text;
              return await step.prompt(NAME_PROMPT, promptoptions );
              }

async STEP_4(step) //INPUT-Please shout something
            {
;var text=await this.ReplacePragmas(step,STRING_4);
var promptoptions=text;
              return await step.prompt(NAME_PROMPT, promptoptions );
              }

async STEP_8(step) //LUIS-Choose a color using natural language (LUIS)
          {
var text=await this.ReplacePragmas(step,STRING_8);
var promptoptions=text;
            return await step.prompt(NAME_PROMPT, promptoptions );
            }

async STEP_12(step) //QNA-Chitchat with me (EXIT to leave)
          {
var text=await this.ReplacePragmas(step,STRING_12);
var promptoptions=text;
          return await step.prompt(NAME_PROMPT, promptoptions );
          }

async STEP_14(step) //INPUT-Ask B
            {
;var text=await this.ReplacePragmas(step,STRING_14);
var promptoptions=text;
              return await step.prompt(NAME_PROMPT, promptoptions );
              }
    

//ABSTRACTIONS FOR NODE AND C#
    async ReplacePragmas(step,text){
        let userProfile = await this.userProfileAccessor.get(step.context);
        for (var attrname in userProfile)
        {
            text=text.replace("{" + attrname + "}",userProfile[attrname]);
        }
        return text;
    }
    addProp(userProfile,key,value)
    {
        userProfile[key]=value;
    }
    getProp(userProfile,key)
    {
        if (!userProfile[key])
            return "";
        else
            return userProfile[key];
    }
    evalCondition(expression)
    {
        return eval(expression);
    }
    LuisRec(applicationId, endpointKey, endpoint){
        return new LuisRecognizer({
                 applicationId: applicationId,
                 endpointKey: endpointKey,
                 endpoint:  endpoint
            });
    }
    QnA(EndpointKey, KbId, Hostname){
        var qnaEndpointSettings = {
            knowledgeBaseId: KbId,
            endpointKey: EndpointKey,
            host: Hostname
        };
        return new QnAMaker(qnaEndpointSettings);
    }
    suggestActionsOptions(prompt,choices)
    {
        return MessageFactory.suggestedActions(choices,prompt);
    }
}

exports.MainDialog = Main;