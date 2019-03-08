// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// DEPLOYMENT INSTRUCTIONS:
// 1. GET FULL NODE PROJECT FROM: https://github.com/luisalvesmartins/botconversationdesigner/tree/master/botcode/nodejs
// 2. REPLACE THE FILE DIALOGS/MAIN.JS WITH THIS CONTENT 
// 3. RUN THE BOT

// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const { MessageFactory, CardFactory } = require('botbuilder');
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');

// Dialog IDs
const MAIN_DIALOG = 'mainDialog';

// Prompt IDs
const NAME_PROMPT = 'namePrompt';

// TEXT STRINGS
const STRING_1="I am the Echo Bot Sample. Hint: read the flow on the right and try the different paths";
const STRING_2="Please shout something";
const STRING_3="You said: {SHOUT}";
const STRING_4="Check if you are saying ECHO";
const STRING_5="ECHO... ECHO... ECHO...";
const STRING_6="Choose a color using natural language (LUIS)";
const STRING_7="Blue: nice color!";
const STRING_8="Red: nice color!";
const STRING_9="I couldn't figure it out so you can play with QNAMaker";
const STRING_10="Chitchat with me (EXIT to leave)";
const STRING_11="is EXIT?";


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

          case 2:  //INPUT-Please shout something
   return await this.STEP_2(step);

          case 3:  //MESSAGE-You said: {SHOUT}
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_3) );
              return await step.next();

          case 4:  //IF-Check if you are saying ECHO
return await step.next();

          case 5:  //MESSAGE-ECHO... ECHO... ECHO...
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_5) );
              return await step.next();

          case 6:  //LUIS-Choose a color using natural language (LUIS)
   return await this.STEP_6(step);

          case 7:  //MESSAGE-Blue: nice color!
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_7) );
              return await step.next();

          case 8:  //MESSAGE-Red: nice color!
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_8) );
              return await step.next();

          case 9:  //MESSAGE-I couldn't figure it out so you can play with QNAMaker
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_9) );
              return await step.next();

          case 10:  //QNA-Chitchat with me (EXIT to leave)
   return await this.STEP_10(step);

          case 11:  //IF-is EXIT?
return await step.next();
    
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

            case 2:  //INPUT-Please shout something
if (stepResult!="")
              this.addProp(userProfile,"SHOUT",stepResult);
              userProfile.step=3;
            break;

            case 3:  //MESSAGE-You said: {SHOUT}
userProfile.step=4;
            break;

            case 4:  //IF-Check if you are saying ECHO
expression=await this.ReplacePragmas(step, "\"{SHOUT}\"==\"ECHO\"");
            if (this.evalCondition(expression))
              userProfile.step=5;
            else
              userProfile.step=2;
            break;

            case 5:  //MESSAGE-ECHO... ECHO... ECHO...
userProfile.step=6;
            break;

            case 6:  //LUIS-Choose a color using natural language (LUIS)
var luisRecognizer=this.LuisRec("914db407-b188-442c-8306-c9cb781faadc","c6e72331a84c4d23a590c503c360c35b","https://westus.api.cognitive.microsoft.com");
            var results = await luisRecognizer.recognize(step.context);var topIntent = LuisRecognizer.topIntent(results);
            this.addProp(userProfile,"LUISVAR",stepResult);
            userProfile.step=6;
if (topIntent==await this.ReplacePragmas(step,"blue_intent")) userProfile.step=7;
if (topIntent==await this.ReplacePragmas(step,"red_intent")) userProfile.step=8;
if (topIntent==await this.ReplacePragmas(step,"None")) userProfile.step=9;

          break;

            case 7:  //MESSAGE-Blue: nice color!
userProfile.step=2;
            break;

            case 8:  //MESSAGE-Red: nice color!
userProfile.step=2;
            break;

            case 9:  //MESSAGE-I couldn't figure it out so you can play with QNAMaker
userProfile.step=10;
            break;

            case 10:  //QNA-Chitchat with me (EXIT to leave)
var qnaMaker=this.QnA("b8fb0e89-daeb-46f0-9a23-3762df2080a3", "b99d3036-03b3-41c0-98dd-6c90a7aee95c", "https://lambotengineqna.azurewebsites.net/qnamaker");
        var qnaResults = await qnaMaker.generateAnswer(stepResult, 1, 0.1); if (qnaResults[0]) {var res=qnaResults[0].answer;
            await step.context.sendActivity(res);
          }
          else
            await step.context.sendActivity("Sorry, didn't find answers in the KB.");

          this.addProp(userProfile,"QNA",stepResult);

          userProfile.step=11;
          break;

            case 11:  //IF-is EXIT?
expression=await this.ReplacePragmas(step, "\"{QNA}\"==\"EXIT\"");
            if (this.evalCondition(expression))
              userProfile.step=2;
            else
              userProfile.step=10;
            break;
            
       
            default:
                break;
        }
        await this.userProfileAccessor.set(step.context, userProfile);


        return await step.replaceDialog(MAIN_DIALOG);
    }
///FUNCTIONS

async STEP_2(step) //INPUT-Please shout something
            {
;var text=await this.ReplacePragmas(step,STRING_2);
var promptoptions=text;
              return await step.prompt(NAME_PROMPT, promptoptions );
              }

async STEP_6(step) //LUIS-Choose a color using natural language (LUIS)
          {
var text=await this.ReplacePragmas(step,STRING_6);
var promptoptions=text;
            return await step.prompt(NAME_PROMPT, promptoptions );
            }

async STEP_10(step) //QNA-Chitchat with me (EXIT to leave)
          {
var text=await this.ReplacePragmas(step,STRING_10);
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

}

exports.MainDialog = Main;