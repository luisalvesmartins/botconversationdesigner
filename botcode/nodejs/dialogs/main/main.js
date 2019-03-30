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
var request=require('request-promise');
var jsel=require('jsel');

// Dialog IDs
const MAIN_DIALOG = 'mainDialog';

// Prompt IDs
const NAME_PROMPT = 'namePrompt';
const CHOICE_PROMPT = 'choicePrompt';

var dialogStack=[];

// TEXT STRINGS
const STRING_1="# I am the conversation designer demo";
const STRING_2="## Read the graphic flow and watch the synchronization between the flow and the chat";
const STRING_3="What do you want to try?";
const STRING_8="Please shout something. (Exit to leave)";
const STRING_9="You said: {SHOUT}";
const STRING_15="Chitchat with me in English (EXIT to leave)";
const STRING_19="Choose the new language";
const STRING_20="Language changed to {CURRENT_LANGUAGE}";
const STRING_23="Choose a color using natural language (LUIS)";
const STRING_24="Blue: nice color!";
const STRING_25="Red: nice color!";
const STRING_26="No intent detected";


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

          case 1:  //START-# I am the conversation designer demo-Main
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_1) );
              return await step.next();

          case 2:  //MESSAGE-## Read the graphic flow and watch the synchronization between the flow and the chat-Main
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_2) );
              return await step.next();

          case 3:  //CHOICE-What do you want to try?-Main
   return await this.STEP_3(step);

          case 4:  //DIALOG-LUIS Dialog-Main
//ADD TO THE DIALOG STACK
          dialogStack.push({step:3,dialog:"Main"});
          return await step.next();

          case 5:  //DIALOG-Echo Dialog-Main
//ADD TO THE DIALOG STACK
          dialogStack.push({step:3,dialog:"Main"});
          return await step.next();

          case 6:  //DIALOG-QNA Dialog-Main
//ADD TO THE DIALOG STACK
          dialogStack.push({step:3,dialog:"Main"});
          return await step.next();

          case 7:  //DIALOG-Change Language Dialog-Main
//ADD TO THE DIALOG STACK
          dialogStack.push({step:3,dialog:"Main"});
          return await step.next();

          case 8:  //INPUT-Please shout something. (Exit to leave)-ECHO
   return await this.STEP_8(step);

          case 9:  //MESSAGE-You said: {SHOUT}-ECHO
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_9) );
              return await step.next();

          case 10:  //IF-Did user type EXIT ?-ECHO
return await step.next();

          case 11:  //DIALOGSTART-StartDialog-ECHO
return await step.next();

          case 12:  //DIALOGEND-EndDialog-ECHO
return await step.next();

          case 13:  //DIALOGSTART-StartDialog-QnA
return await step.next();

          case 14:  //DIALOGEND-EndDialog-QnA
return await step.next();

          case 15:  //QNA-Chitchat with me in English (EXIT to leave)-QnA
   return await this.STEP_15(step);

          case 16:  //IF-Did the user type EXIT?-QnA
return await step.next();

          case 17:  //DIALOGSTART-StartDialog-LANGUAGE
return await step.next();

          case 18:  //DIALOGEND-EndDialog-LANGUAGE
return await step.next();

          case 19:  //CHOICE-Choose the new language-LANGUAGE
   return await this.STEP_19(step);

          case 20:  //MESSAGE-Language changed to {CURRENT_LANGUAGE}-LANGUAGE
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_20) );
              return await step.next();

          case 21:  //DIALOGSTART-StartDialog-LUIS
return await step.next();

          case 22:  //DIALOGEND-EndDialog-LUIS
return await step.next();

          case 23:  //LUIS-Choose a color using natural language (LUIS)-LUIS
   return await this.STEP_23(step);

          case 24:  //MESSAGE-Blue: nice color!-LUIS
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_24) );
              return await step.next();

          case 25:  //MESSAGE-Red: nice color!-LUIS
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_25) );
              return await step.next();

          case 26:  //MESSAGE-No intent detected-LUIS
   await step.context.sendActivity( await this.ReplacePragmas(step,STRING_26) );
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

            case 1:  //START-# I am the conversation designer demo-Main
userProfile.step=2;
            break;

            case 2:  //MESSAGE-## Read the graphic flow and watch the synchronization between the flow and the chat-Main
userProfile.step=3;
            break;

            case 3:  //CHOICE-What do you want to try?-Main
this.addProp(userProfile,"",stepResult);            if (stepResult==await this.ReplacePragmas(step,"LUIS")) userProfile.step=4;
if (stepResult==await this.ReplacePragmas(step,"QnA")) userProfile.step=6;
if (stepResult==await this.ReplacePragmas(step,"Change Language")) userProfile.step=7;
if (stepResult==await this.ReplacePragmas(step,"ECHO")) userProfile.step=5;

            break;

            case 4:  //DIALOG-LUIS Dialog-Main
              userProfile.step=23;
          break;

            case 5:  //DIALOG-Echo Dialog-Main
              userProfile.step=8;
          break;

            case 6:  //DIALOG-QNA Dialog-Main
              userProfile.step=15;
          break;

            case 7:  //DIALOG-Change Language Dialog-Main
              userProfile.step=19;
          break;

            case 8:  //INPUT-Please shout something. (Exit to leave)-ECHO
if (stepResult!="")
              this.addProp(userProfile,"SHOUT",stepResult);
              userProfile.step=9;
            break;

            case 9:  //MESSAGE-You said: {SHOUT}-ECHO
userProfile.step=10;
            break;

            case 10:  //IF-Did user type EXIT ?-ECHO
expression=await this.ReplacePragmas(step, "\"{SHOUT}\".toUpperCase()==\"EXIT\"");
            if (this.evalCondition(expression))
              userProfile.step=12;
            else
              userProfile.step=8;
            break;

            case 11:  //DIALOGSTART-StartDialog-ECHO
              userProfile.step=8;
          break;

            case 12:  //DIALOGEND-EndDialog-ECHO
//RESTORE FROM THE DIALOG STACK
          var st=dialogStack.pop();
          userProfile.step=st.step;
          break;

            case 13:  //DIALOGSTART-StartDialog-QnA
              userProfile.step=15;
          break;

            case 14:  //DIALOGEND-EndDialog-QnA
//RESTORE FROM THE DIALOG STACK
          var st=dialogStack.pop();
          userProfile.step=st.step;
          break;

            case 15:  //QNA-Chitchat with me in English (EXIT to leave)-QnA
var qnaMaker=this.QnA("b8fb0e89-daeb-46f0-9a23-3762df2080a3", "b99d3036-03b3-41c0-98dd-6c90a7aee95c", "https://lambotengineqna.azurewebsites.net/qnamaker");
        var qnaResults = await qnaMaker.generateAnswer(stepResult, 1, 0.1); if (qnaResults[0]) {var res=qnaResults[0].answer;
            await step.context.sendActivity(res);
          }
          else
            await step.context.sendActivity("Sorry, didn't find answers in the KB.");

          this.addProp(userProfile,"QNA",stepResult);

          userProfile.step=16;
          break;

            case 16:  //IF-Did the user type EXIT?-QnA
expression=await this.ReplacePragmas(step, "\"{QNA}\".toUpperCase()==\"EXIT\"");
            if (this.evalCondition(expression))
              userProfile.step=14;
            else
              userProfile.step=15;
            break;

            case 17:  //DIALOGSTART-StartDialog-LANGUAGE
              userProfile.step=19;
          break;

            case 18:  //DIALOGEND-EndDialog-LANGUAGE
//RESTORE FROM THE DIALOG STACK
          var st=dialogStack.pop();
          userProfile.step=st.step;
          break;

            case 19:  //CHOICE-Choose the new language-LANGUAGE
this.addProp(userProfile,"CURRENT_LANGUAGE",stepResult);            if (stepResult==await this.ReplacePragmas(step,"en-US")) userProfile.step=20;
if (stepResult==await this.ReplacePragmas(step,"fr-FR")) userProfile.step=20;
if (stepResult==await this.ReplacePragmas(step,"pt-PT")) userProfile.step=20;

            break;

            case 20:  //MESSAGE-Language changed to {CURRENT_LANGUAGE}-LANGUAGE
userProfile.step=18;
            break;

            case 21:  //DIALOGSTART-StartDialog-LUIS
              userProfile.step=23;
          break;

            case 22:  //DIALOGEND-EndDialog-LUIS
//RESTORE FROM THE DIALOG STACK
          var st=dialogStack.pop();
          userProfile.step=st.step;
          break;

            case 23:  //LUIS-Choose a color using natural language (LUIS)-LUIS
var luisRecognizer=this.LuisRec("914db407-b188-442c-8306-c9cb781faadc","c6e72331a84c4d23a590c503c360c35b","https://westus.api.cognitive.microsoft.com");
            var results = await luisRecognizer.recognize(step.context);var topIntent = LuisRecognizer.topIntent(results);
            this.addProp(userProfile,"LUISVAR",stepResult);
            userProfile.step=23;
if (topIntent==await this.ReplacePragmas(step,"blue_intent")) userProfile.step=24;
if (topIntent==await this.ReplacePragmas(step,"red_intent")) userProfile.step=25;
if (topIntent==await this.ReplacePragmas(step,"none")) userProfile.step=26;

          break;

            case 24:  //MESSAGE-Blue: nice color!-LUIS
userProfile.step=22;
            break;

            case 25:  //MESSAGE-Red: nice color!-LUIS
userProfile.step=22;
            break;

            case 26:  //MESSAGE-No intent detected-LUIS
userProfile.step=23;
            break;
            
       
            default:
                break;
        }
        await this.userProfileAccessor.set(step.context, userProfile);


        return await step.replaceDialog(MAIN_DIALOG);
    }
///FUNCTIONS

async STEP_3(step) //CHOICE-What do you want to try?-Main
          {
            return await step.prompt(NAME_PROMPT,this.suggestActionsOptions(await this.ReplacePragmas(step,STRING_3), [await this.ReplacePragmas(step,"LUIS"),await this.ReplacePragmas(step,"QnA"),await this.ReplacePragmas(step,"Change Language"),await this.ReplacePragmas(step,"ECHO")]));
          }

async STEP_8(step) //INPUT-Please shout something. (Exit to leave)-ECHO
            {
;var text=await this.ReplacePragmas(step,STRING_8);
var promptoptions=text;
              return await step.prompt(NAME_PROMPT, promptoptions );
              }

async STEP_15(step) //QNA-Chitchat with me in English (EXIT to leave)-QnA
          {
var text=await this.ReplacePragmas(step,STRING_15);
var promptoptions=text;
          return await step.prompt(NAME_PROMPT, promptoptions );
          }

async STEP_19(step) //CHOICE-Choose the new language-LANGUAGE
          {
            return await step.prompt(NAME_PROMPT,this.suggestActionsOptions(await this.ReplacePragmas(step,STRING_19), [await this.ReplacePragmas(step,"en-US"),await this.ReplacePragmas(step,"fr-FR"),await this.ReplacePragmas(step,"pt-PT")]));
          }

async STEP_23(step) //LUIS-Choose a color using natural language (LUIS)-LUIS
          {
var text=await this.ReplacePragmas(step,STRING_23);
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
    async RESTCall(command){
        var lines=command.split('\n');
        lines[0]=lines[0].trim();
        var p=lines[0].indexOf(' ');
        var verb="GET";
        var url=lines[0];
        if (p>0)
        {
          verb=lines[0].substring(0,p);
          url=lines[0].substring(p+1);
        }
        var header="";
        var index;
        for (index = 1; index < lines.length; index++) {
          const element = lines[index].trim();
          if (element=="")
            break;
          else{
            p=element.indexOf(':');
            if (p<=0)
              return {error:"no header dev"}
            if (header!="")        
              header+=",";
            header+="\"" + element.substring(0,p).trim() + "\":\"" + element.substring(p+1).trim() + "\"";
          }
        }
        header="{" + header + "}";
      
        var data="";
        for (index=index;index < lines.length; index++) {
          data+=lines[index];
        }

        var r= {verb:verb, url:url, headers:JSON.parse(header), data:data};
        return await request({
            "method":r.verb, 
            "uri": r.url,
            "headers":r.headers,
            "body":r.data,
        }).then(
            function(data){
                return data;
                }, 
            function(data){
            console.log("ERROR");
            //console.log(data);
            return data;
        });
    }
    async RESTCallStep(req,key,card) {
        var returnValue=await this.RESTCall(req);
        var dom = jsel(JSON.parse(returnValue));
             
        //FILTER= a.parKey
        var results=dom.selectAll(key);
        var extension="";
        for (let index = 0; index < results.length; index++) {
            const element = results[index];
    
            var dom2 = jsel(element);
    
            //SEARCH a.parCrd for ${}
            var crd=card;
            var p=1;
            while(p>0) {
                p=crd.indexOf("${");
                if (p>=0)
                {
                    var pd=crd.indexOf("}",p);
                    var field=crd.substring(p+2,pd);
        
                    var text=dom2.select(field);
        
                    crd=crd.substring(0,p) + text + crd.substring(pd+1);
                }
            }
    
            if (extension!="")
                extension+=","
            extension+=crd;
        }
        return "[" + extension + "]";
    }
}

exports.MainDialog = Main;