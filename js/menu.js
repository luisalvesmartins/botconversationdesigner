var menu =
{
  settings: function () {
    $('#Settings').modal();
  },
  preserve: function () {
    if (typeof (Storage) !== "undefined") {
      localStorage.setItem("cookiePreserve", document.all("cookiePreserve").checked);
      localStorage.setItem("chkLUISDebug", document.all("chkLUISDebug").checked);
      if (document.all("cookiePreserve").checked)
        localStorage.setItem("flow", JSON.stringify(LoadAndSave.prepareSave()));
    } else {
      alert("Sorry! No Web Storage support..");
    }
  },
  exportNodejs: function () {
    readTextFilePromise("templatenodejs.txt").then(function (template) {
      var CONTEXT_NEXT = "return await step.next();\n";
      var STRING_DECLARATION = "const ";
      var SEND_ACTIVITY = "step.context.sendActivity";
      var STEP_DECLARATION = "";
      var FUNCTION_DECLARATION = "async ";
      var PROMPT_FUNCTION = "prompt";
      var PROMPT_CONVERSION = "var promptoptions=text;";
      var GETUSERPROFILE = "let userProfile = await this.userProfileAccessor.get(step.context);\n";
      var SUGGESTEDACTIONS = "this.suggestActionsOptions";
      var LUIS_RECOGNIZE = "var results = await luisRecognizer.recognize(step.context);var topIntent = LuisRecognizer.topIntent(results);";
      var QNA_RESULTS = "var qnaResults = await qnaMaker.generateAnswer(stepResult, 1, 0.1); if (qnaResults[0]) {var res=qnaResults[0].answer;";
      var ARRAY_PREFIX = "[";
      var ARRAY_SUFIX = "]";
      var CHOICE_FUNCTION = "NAME_PROMPT";
      var DIALOG_PUSH="dialogStack.push({step:ELEMENT_STEP,dialog:\"ELEMENT_DIALOG\"});";

      menu.exportcore(template, CONTEXT_NEXT, STRING_DECLARATION, SEND_ACTIVITY, STEP_DECLARATION, FUNCTION_DECLARATION, PROMPT_FUNCTION, PROMPT_CONVERSION, GETUSERPROFILE, SUGGESTEDACTIONS, LUIS_RECOGNIZE, QNA_RESULTS, ARRAY_PREFIX, ARRAY_SUFIX, CHOICE_FUNCTION,DIALOG_PUSH);

    });
  },
  exportCsharp: function () {
    readTextFilePromise("templatecsharp.txt").then(function (template) {
      var CONTEXT_NEXT = "return await step.NextAsync();\n";
      var STRING_DECLARATION = "public const string ";
      var SEND_ACTIVITY = "step.Context.SendActivityAsync";
      var STEP_DECLARATION = "WaterfallStepContext ";
      var FUNCTION_DECLARATION = "async Task&lt;DialogTurnResult> ";
      var PROMPT_FUNCTION = "PromptAsync";
      var PROMPT_CONVERSION = "var promptoptions = new PromptOptions{Prompt = new Activity{Type = ActivityTypes.Message,Text = text,}};";
      var GETUSERPROFILE = "var userProfile = await UserProfileAccessor.GetAsync(step.Context, () => null);\n";
      var SUGGESTEDACTIONS = "suggestActionsOptions";
      var LUIS_RECOGNIZE = "var results = await luisRecognizer.RecognizeAsync(step.Context,new CancellationToken());var topIntent = LuisRecognizer.TopIntent(results);";
      var QNA_RESULTS = "await qnaResultsDisplay(step, ACTUAL_STEP, userProfile, qnaResults, cancellationToken);";
      var ARRAY_PREFIX = "new string[]{";
      var ARRAY_SUFIX = "}";
      var CHOICE_FUNCTION = "CHOICE_PROMPT";
      var DIALOG_PUSH="dialogStack.push(new DialogStep {step=ELEMENT_STEP,dialog=\"ELEMENT_DIALOG\"});";

      menu.exportcore(template, CONTEXT_NEXT, STRING_DECLARATION, SEND_ACTIVITY, STEP_DECLARATION, FUNCTION_DECLARATION, PROMPT_FUNCTION, PROMPT_CONVERSION, GETUSERPROFILE, SUGGESTEDACTIONS, LUIS_RECOGNIZE, QNA_RESULTS, ARRAY_PREFIX, ARRAY_SUFIX, CHOICE_FUNCTION,DIALOG_PUSH);
    });
  },
  comment: function (element) {
    return element.type + '-' + replaceAll(element.text, '\n', '') + '-' + replaceAll(element.dialog, '\n', '');
  },
  exportcore: function (template, CONTEXT_NEXT, STRING_DECLARATION, SEND_ACTIVITY, STEP_DECLARATION, FUNCTION_DECLARATION, PROMPT_FUNCTION, PROMPT_CONVERSION, GETUSERPROFILE, SUGGESTEDACTIONS, LUIS_RECOGNIZE, QNA_RESULTS, ARRAY_PREFIX, ARRAY_SUFIX, CHOICE_FUNCTION,DIALOG_PUSH) {
    var flow = LoadAndSave.prepareSave().flow;
    //ORDER ELEMENTS
    var startElement = searchArray(flow, "START", "type");
    startElement.newIndex = 1;

    var index = 1;
    var goto = startElement;
    do {
      var next = Bot.getNext(goto.next, "");
      if (!next) {
        if (goto.next.length > 0)
          next = goto.next[0].to;
      }
      if (next) {
        var goto = searchArray(flow, next, "key")
        if (goto.newIndex)
          next = null;
        else {
          index++;
          goto.newIndex = index;
        }
      }
    } while (next);

    for (let i = 0; i < flow.length; i++) {
      const element = flow[i];
      if (!element.newIndex) {
        index++;
        element.newIndex = index;
      }
    }

    flow.sort(compare);

    //  console.log(flow);

    //CONSTANTS
    var output = "";
    for (let index = 0; index < flow.length; index++) {
      const element = flow[index];
      if (element.type!="DIALOGSTART" && element.type!="DIALOGEND" && element.type!="IF" && element.type!="DIALOG")
        output += STRING_DECLARATION + 'STRING_' + element.newIndex + '="' + replaceAll(element.text, '\n', '') + '";\n';
    }
    template = template.replace("###TEXTSTRINGS###", output);

    //STEPS
    output = "";
    var movenext = "";
    var functions = "";
    for (let index = 0; index < flow.length; index++) {
      const element = flow[index];

      var nextKey = Bot.getNext(element.next, "");
      var nextElem = searchArray(flow, nextKey, "key", element.dialog);
      var n = "\"ERROR\"";
      if (nextElem)
        n = nextElem.newIndex;

      //output+="//" + JSON.stringify(element) + "\n";
      //movenext+="//" + JSON.stringify(element) + "\n";
      //movenext+=`//${JSON.stringify(element.next)}\n`;

      output += `\n          case ${element.newIndex}:  //${menu.comment(element)}\n`;
      movenext += `\n            case ${element.newIndex}:  //${menu.comment(element)}\n`;

      switch (element.type) {
        case "API":
          output += `   ${CONTEXT_NEXT};\n`;
          movenext += `userProfile.step=${n};\n            break;\n`;
          break;
        case "REST":
          output += `   

          var req=await this.ReplacePragmas(step,\`${element.parPar}\`);
          var key=await this.ReplacePragmas(step,\`${element.parKey}\`);
          var card=await this.ReplacePragmas(step,JSON.stringify(${element.parCrd}));
          var attachments=await this.RESTCallStep(req,key,card);
          await step.context.sendActivity( MessageFactory.carousel(JSON.parse(attachments)) );
          ${CONTEXT_NEXT}`;
          movenext += `userProfile.step=${n};\n            break;\n`;

          break;
        case "CARD":
          switch (element.parCar) {
            case "adaptiveCard":
              output += `   var card=${replaceAll(element.parCrd, '\n', '')};
            card=JSON.parse(await this.ReplacePragmas(step,JSON.stringify(card)));
            await ${SEND_ACTIVITY}({
              text: await this.ReplacePragmas(step,STRING_${element.newIndex}),
              attachments: [CardFactory.adaptiveCard(card)]
                });
                ${CONTEXT_NEXT}`;
                break;

            default:
              break;
          }
          movenext += `userProfile.step=${n};\n            break;\n`;
          break;
        case "CHOICE":
          var s = "";
          var op = "";
          for (let i = 0; i < element.next.length; i++) {
            const elementNext = element.next[i];
            var t = searchArray(flow, elementNext.to, "key",element.dialog).newIndex;
            s += "if (stepResult==await this.ReplacePragmas(step,\"" + elementNext.text + "\")) userProfile.step=" + t + ";\n";
            if (op != "") op += ",";
            op += "await this.ReplacePragmas(step,\"" + elementNext.text + "\")";
          }
          output += `   return await this.STEP_${element.newIndex}(step);\n`;
          functions += `\n${FUNCTION_DECLARATION}STEP_${element.newIndex}(${STEP_DECLARATION}step) //${menu.comment(element)}
          {
            return await step.${PROMPT_FUNCTION}(${CHOICE_FUNCTION},${SUGGESTEDACTIONS}(await this.ReplacePragmas(step,STRING_${element.newIndex}), ${ARRAY_PREFIX}${op}${ARRAY_SUFIX}));
          }\n`;
          movenext += `this.addProp(userProfile,"${element.parVar}",stepResult);            ${s}\n            break;\n`;
          break;
        case "DIALOG":
          output += `//ADD TO THE DIALOG STACK\n
          ${DIALOG_PUSH.replace("ELEMENT_STEP",n).replace("ELEMENT_DIALOG",element.dialog)}
          ${CONTEXT_NEXT}`;
          //dialogStack.push({step:${n},dialog:"${element.dialog}"});

          //SEARCH FOR START DIALOG
          var newN=-1;
          for (let index = 0; index < flow.length; index++) {
            const elementDialog = flow[index];
            if (elementDialog.type=="DIALOGSTART" && elementDialog.dialog==element.parAPI)
            {
              nextElem = searchArray(flow, elementDialog.next[0].to, "key", element.parAPI);
              newN=nextElem.newIndex;
            }
          }
          movenext+=`              userProfile.step=${newN};
          break;\n`;
          break;
        case "DIALOGSTART":
          output += `${CONTEXT_NEXT}`;
          movenext+=`              userProfile.step=${n};
          break;\n`;
          break;
        case "DIALOGEND":
          output += `${CONTEXT_NEXT}`;
          movenext+=`//RESTORE FROM THE DIALOG STACK
          userProfile.step=dialogStack.pop().step;
          break;\n`;
          break;
        case "LUIS":
          output += `   return await this.STEP_${element.newIndex}(step);\n`;
          functions += `\n${FUNCTION_DECLARATION}STEP_${element.newIndex}(${STEP_DECLARATION}step) //${menu.comment(element)}
          {\n`;
          if (element.parCkv == "No") {
            functions += `${GETUSERPROFILE}
            var text="";
            if (this.getProp(userProfile,"${element.parVar}")!="")
              ${CONTEXT_NEXT}
            else
              text=await this.ReplacePragmas(step,STRING_${element.newIndex});`;
          }
          else
            functions += `var text=await this.ReplacePragmas(step,STRING_${element.newIndex});\n`;
          functions += `${PROMPT_CONVERSION}
            return await step.${PROMPT_FUNCTION}(NAME_PROMPT, promptoptions );
            }\n`;
          var s = `userProfile.step=${element.newIndex};\n`;
          for (let i = 0; i < element.next.length; i++) {
            const elementNext = element.next[i];
            var t = searchArray(flow, elementNext.to, "key",element.dialog).newIndex;
            s += "if (topIntent==await this.ReplacePragmas(step,\"" + elementNext.text + "\")) userProfile.step=" + t + ";\n";
          }
          movenext += `var luisRecognizer=this.LuisRec("${element.parPar}","${element.parKey}","${element.parURL}");
            ${LUIS_RECOGNIZE}
            this.addProp(userProfile,"${element.parVar}",stepResult);
            ${s}
          break;\n`;
          break;
        case "QNA":
          output += `   return await this.STEP_${element.newIndex}(step);\n`;
          functions += `\n${FUNCTION_DECLARATION}STEP_${element.newIndex}(${STEP_DECLARATION}step) //${menu.comment(element)}
          {\n`;
          functions += `var text=await this.ReplacePragmas(step,STRING_${element.newIndex});\n`;
          functions += `${PROMPT_CONVERSION}
          return await step.${PROMPT_FUNCTION}(NAME_PROMPT, promptoptions );
          }\n`;
          movenext += `var qnaResults = await QueryQnAServiceAsync(stepResult, "${element.parKey}", "${element.parPar}", "${element.parURL}");
          userProfile.step=${n};
          ${QNA_RESULTS.replace("ACTUAL_STEP",element.newIndex)}
          this.addProp(userProfile,"${element.parVar}",stepResult);
          break;\n`;
          break;
        case "SEARCH":
          output += `   return await this.STEP_${element.newIndex}(step);\n`;
          functions += `\n${FUNCTION_DECLARATION}STEP_${element.newIndex}(${STEP_DECLARATION}step) //${menu.comment(element)}
          {\n`;
          functions += `var text=await this.ReplacePragmas(step,STRING_${element.newIndex});\n`;
          functions += `${PROMPT_CONVERSION}
          return await step.${PROMPT_FUNCTION}(NAME_PROMPT, promptoptions );
          }\n`;
          movenext += `await SearchQuery(step, "${element.parTx0}", "${element.parKey}", "${element.parTx1}", "${element.parAPI}", "${element.parTyp}", "${element.parPar}", stepResult);
          userProfile.step=${n};
          this.addProp(userProfile,"${element.parVar}",stepResult);
          break;\n`;
          break;
        case "MESSAGE":
        case "START":
          output += `   await ${SEND_ACTIVITY}( await this.ReplacePragmas(step,STRING_${element.newIndex}) );
              ${CONTEXT_NEXT}`;
          movenext += `userProfile.step=${n};\n            break;\n`;
          break;
        case "INPUT":
          output += `   return await this.STEP_${element.newIndex}(step);\n`;
          functions += `\n${FUNCTION_DECLARATION}STEP_${element.newIndex}(${STEP_DECLARATION}step) //${menu.comment(element)}
            {\n;`;
          if (element.parCkv == "No") {
            functions += `${GETUSERPROFILE}
              var text="";
              if (this.getProp(userProfile,"${element.parVar}")!="")
                ${CONTEXT_NEXT}
              else
                text=await this.ReplacePragmas(step,STRING_${element.newIndex});`;
          }
          else
            functions += `var text=await this.ReplacePragmas(step,STRING_${element.newIndex});\n`;
          functions += `${PROMPT_CONVERSION}
              return await step.${PROMPT_FUNCTION}(NAME_PROMPT, promptoptions );
              }\n`;
          //AQUI            
          movenext += `if (stepResult!="")
              this.addProp(userProfile,"${element.parVar}",stepResult);
              userProfile.step=${n};
            break;\n`;
          break;
        case "IF":
          var t = element.next[0].to;
          var f = element.next[1].to;
          if (element.next[0].text == "false") {
            f = element.next[0].to;
            t = element.next[1].to;
          }
          t = searchArray(flow, t, "key",element.dialog).newIndex;
          f = searchArray(flow, f, "key",element.dialog).newIndex;
          output += `${CONTEXT_NEXT}`;
          movenext += `expression=await this.ReplacePragmas(step, "${replaceAll(element.parCon, "\"", "\\\"")}");
            if (this.evalCondition(expression))
              userProfile.step=${t};
            else
              userProfile.step=${f};
            break;\n`;
          break;
        default:
          output += `   return await this.STEP_${element.newIndex}(step);\n`;
          functions += `\n${FUNCTION_DECLARATION}STEP_${element.newIndex}(${STEP_DECLARATION}step) //${menu.comment(element)}
            {
              var text=await this.ReplacePragmas(step,STRING_${element.newIndex});
              ${PROMPT_CONVERSION}
              return await step.${PROMPT_FUNCTION}(NAME_PROMPT, promptoptions );
            }\n`;
          movenext += `userProfile.step=${n};
            break;\n`;
          break;
      }


      //if (element.parVar){
    }

    template = template.replace("###FUNCTIONS###", functions);
    template = template.replace("###MOVENEXT###", movenext);

    template = template.replace("###STEPS###", output);
    var w = window.open("", "");
    w.document.write("<pre>" + template + "</pre>");
  },
  new: function () {
    Tab.init();
    myDiagram.model = go.Model.fromJson("{}")
    Tab.dialogs={};
  },
  save: function () {
    var flow = JSON.stringify(LoadAndSave.prepareSave());
    document.getElementById("mySavedModel").value = flow;

    var textToSave = flow;
    var textToSaveAsBlob = new Blob([textToSave], { type: "text/plain" });
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = "bot.botdesign";

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = menu.destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
  },
  load: function () {
    $('#fileToLoad').focus().click();
  },
  handleFileSelect: function () {
    var fileToLoad = document.getElementById("fileToLoad").files[0];
    var fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
      var textFromFileLoaded = fileLoadedEvent.target.result;
      document.getElementById("mySavedModel").value = textFromFileLoaded;
      var model = JSON.parse(textFromFileLoaded);
      if (!model.dialogs)
      {
          model.dialogs=[model.diagram];
          delete model.diagram;
      }
      else
        Tab.dialogs=model.dialogs;
      if (model.tabs){
        Tab.tabs=model.tabs;
        Tab.selected=0;
        Tab.draw();
      }
      else
        Tab.init();
      myDiagram.model = go.Model.fromJson(model.dialogs[0]);
      LoadAndSave.loadDiagramProperties();
      Bot.userData = {};
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
  },
  handleFileScenarioSelect: function () {
    var fileToLoad = document.getElementById("fileScenarioToLoad").files[0];
    var fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
      var textFromFileLoaded = fileLoadedEvent.target.result;
            
      scenario = JSON.parse(textFromFileLoaded);

      myPalette.model=new go.GraphLinksModel(scenario.Palette);
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
  },
  PlayStep: function () {
    if (myDiagram.selection.count > 0) {
      var key = myDiagram.selection.first().key;
      Bot.processMessage({text:"", playStep:"yes", "next": [{ "to": key, "text": "" }]});
    }
    else
      alert("Select a step first");

  },
  destroyClickedElement: function (event) {
    document.body.removeChild(event.target);
  }
}
