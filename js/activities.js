var menu=
{
  exportNodejs:function(){
    var output="";
    var flow=LoadAndSave.prepareSave().flow;
    for (let index = 0; index < flow.length; index++) {
      const element = flow[index];
      output+='var STRING_' + index + '="' + element.text + '";\n';
    }
    for (let index = 0; index < flow.length; index++) {
      const element = flow[index];
     
      output+=`\nasync STEP_${index}(step){
        return await step.prompt(NAME_PROMPT, STRING_${index}); //${element.text}
      }\n`;

      //if (element.parVar){
    }
    var w=window.open("","");
    w.document.write("<pre>" + output + "</pre>");
    console.log(output);
  },
  exportCsharp:function(){
    var output="";
    var flow=LoadAndSave.prepareSave().flow;
    for (let index = 0; index < flow.length; index++) {
      const element = flow[index];
      output+='string STRING_' + index + '="' + element.text + '";\n';
    }
    for (let index = 0; index < flow.length; index++) {
      const element = flow[index];
      
      output+=`async (stepContext, ct) =>{
        `;
      if (element.parVar){
        output+=`
          if(string.IsNullOrEmpty(stepContext.Values["${element.parVar}"].ToString())) {
          `;
      }
      output+=`
        return await stepContext.PromptAsync("TextPrompt",
              new PromptOptions {
                   Prompt = MessageFactory.Text(STRING_${index}), //${element.text}
              },
              ct
            ).ConfigureAwait(false);`;
            if (element.parVar)
            {
              output+=`} else { return await stepContext.NextAsync(stepContext.Values[${element.parvar}].ToString(), ct); }`;
            }
            output+=`
      },`;
    }
    var csharpWindow=window.open("","");
    csharpWindow.document.write("<pre>" + output + "</pre>");
    console.log(output);
  },
  new:function() {
    myDiagram.model=go.Model.fromJson("{}")
  },
  save:function(){
    var flow=JSON.stringify(LoadAndSave.prepareSave());
    document.getElementById("mySavedModel").value = flow;

    var textToSave = flow;
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
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
  load:function(){

    $('#fileToLoad').focus().click();

    var fileToLoad = document.getElementById("fileToLoad").files[0];
 
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) 
    {
        var textFromFileLoaded = fileLoadedEvent.target.result;
        document.getElementById("mySavedModel").value = textFromFileLoaded;
        var model=JSON.parse(textFromFileLoaded);

        myDiagram.model = go.Model.fromJson(model.diagram);
        LoadAndSave.loadDiagramProperties();
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
  },
  PlayStep:function(){
    if (myDiagram.selection.count>0){
      var flow=LoadAndSave.prepareSave().flow;
      var key=myDiagram.selection.first().key;
      var a=searchArray(flow,key,"key")

      if (a!=null){
        var condition=false;

        //CORE PROCESS
        var messages=[a];
        do {
          condition=false;
          var nxt=Bot.getNext(a.next,"");
          if (nxt)
          {
            var goto=searchArray(flow,nxt,"key")
            messages.push(goto);
            myDiagram.select(myDiagram.findNodeForKey(nxt));
  
            var a=searchArray(flow,nxt,"key")
            if (a.type=="MESSAGE" || a.type=="START")
              condition=true;
          }
          else
          {
            messages.push({type:"MESSAGE", text:"<end of flow>"});
          }
        } while (condition);
        Bot.sendBotMessage(messages);
      }
    }
    else
      alert("Select a step first");
  
  },
  destroyClickedElement:function(event)
  {
      document.body.removeChild(event.target);
  }
}

function searchArray(myArray,nameKey,prop){
  for (var i=0; i < myArray.length; i++) {
      if (myArray[i][prop] === nameKey) {
          return myArray[i];
      }
  }
}

//#region SYNC AND PLAY THE STEP THAT IS SELECTED
function onDrawingEvent(data){
  myDiagram.select(myDiagram.findPartForKey(Number(data)));
}

//#endregion



//#region SHOW DATA
function showDataNodes(data){
  LoadAndSave.removeDataNodes();
  myDiagram.startTransaction("make new node");
  var total=myDiagram.model.nodeDataArray.length;
  for (let index = 0; index < total; index++) {
    const element = myDiagram.model.nodeDataArray[index];
    if (element.parVar!="")
    {
      var text=data[element.parVar];
      if (text!="" && text){
        var b=go.Point.parse(element.loc).offset(20,20);
        if ("#MESSAGE#START#".indexOf("#" + element.type + "#")<0)
          myDiagram.model.addNodeData(    
            {"text":text, 
            "fill":"#FFFFE0", "loc":go.Point.stringify(b), "angle":0, "size":"100 50", 
            "opacity":0.7,
            "type":"DATASHOW"}
          );
      }

    }
  }
  myDiagram.commitTransaction("make new node");
}
//endregion

//#region PARAMETERS
  function parSave(){
    var node = myDiagram.selection.first();
    if (node){
      var data = node.data;
      for(var f=0;f<ParameterList.length;f++){
        var name=ParameterList[f].name;
        if (document.all(name))
        {
            console.log(name + "->" + document.all(name).type)
            data[name]=document.all(name).value;
        }
          
      }
    }
  }
  function parLoad(data){
    for(var f=0;f<ParameterList.length;f++){
        var name=ParameterList[f].name;
        if (data[name]){
          if (document.all(name))
            document.all(name).value=data[name];
        }
      }
  }

var ParameterList=[
    {name:"parVar", default:""},
    {name:"parURL", default:"https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/"},
    {name:"parKey", default:"guid?subscription-key=code"},
    {name:"parTyp", default:""},
    {name:"parLMI", default:"0.5"},
    {name:"parPar", default:""},
    {name:"parCon", default:""},
    {name:"parCar", default:""},
    {name:"parAPI", default:""},
    {name:"parAPO", default:""}
  ];

  function GetFieldList(dataType){
    var Fields=[];
    switch (dataType) {
      case "API":
        Fields=[{name:"parVar"},{name:"parAPI"},{name:"parPar"},{name:"parAPO"}]
        break;
      case "CARD":
        Fields=[{name:"parVar"},{name:"parCar"}]
        break;
      case "CHOICE":
        Fields=[{name:"parVar"}]
        break;
      case "IF":
        Fields=[{name:"parCon"}]
        break;
      case "INPUT":
        Fields=[{name:"parVar"},{name:"parTyp"}]
        break;
      case "LUIS":
        Fields=[{name:"parVar"},
          {name:"parURL", default:"https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/"},
          {name:"parKey",default:"guid?subscription-key=code"},
          {name:"parLMI", default:"0.5"}]
        break;
      case "MESSAGE":
        break;
      case "QNA":
        Fields=[{name:"parVar"},
          {name:"parURL", default:"https://yourdeployment.azurewebsites.net/qnamaker"},
          {name:"parKey", title:"EndpointKey",default:"guid"},
          {name:"parPar", title:"Knowledgebase",default:"guid"},
        ]
        break;
      case "START":
        break;
    default:
      break;
    }
    return Fields;
  }
  function DisplayProperties(data){
      //BUILD FIELDS ACCORDING TO TYPE
      var Fields=GetFieldList(data.type);
      var sHTML="<div>KEY</div>" + data.key + "<div>TEXT</div>" + data.text + "<div>TYPE</div>" + data.type;
      for(var f=0;f<Fields.length;f++){
        var field=Fields[f];
        sHTML+="<div id=t_" + field.name + ">";
        switch (field.name) {
          case "parVar":
            sHTML+="VARIABLE</div><INPUT type=text id=parVar onkeyup='parSave()' style='width:180px'>"
            break;
          case "parTyp":
            sHTML+="TYPE OF INPUT</div><INPUT type=text id=parTyp onkeyup='parSave()' style='width:180px'>"
            break;
          case "parURL":
            sHTML+="URL</div><TEXTAREA id=parURL onkeyup='parSave()' rows=6 cols=21 style='width:180px'></TEXTAREA>"
            break;
          case "parKey":
            sHTML+="Key</div><INPUT type=text id=parKey onkeyup='parSave()' style='width:180px'>"
            break;
          case "parLMI":
            sHTML+="Minimum Score</div><INPUT type=text id=parLMI onkeyup='parSave()' style='width:90px'>"
            break;
          case "parPar":
            sHTML+="Parameters</div><TEXTAREA id=parPar onkeyup='parSave()' rows=6 cols=21 style='width:180px'></TEXTAREA>"
            break;
          case "parCon":
            sHTML+="Condition</div><TEXTAREA id=parCon onkeyup='parSave()' rows=6 cols=21 style='width:180px'></TEXTAREA>"
            break;
          case "parCar":
            sHTML+="Card</div><SELECT id=parCar onkeyup='parSave()' onchange='parSave()'>" +
            "<option>adaptiveCard</option>" + 
            "<option>animationCard</option>" + 
            "<option>audioCard</option>" + 
            "<option>heroCard</option>" + 
            "<option>receiptCard</option>" + 
            "<option>oauthCard</option>" + 
            "<option>signinCard</option>" + 
            "<option>thumbnailCard</option>" + 
            "<option>videoCard</option>" + 
            "</select>";
            break;
          case "parAPI":
            sHTML+="API or URL</div><INPUT type=text id=parAPI onkeyup='parSave()' style='width:180px'>"
            break;
          case "parAPO":
            sHTML+="API Output</div><SELECT id=parAPO onkeyup='parSave()' onchange='parSave()'>" +
            "<option>None</option>" + 
            "<option>Variable</option>" + 
            "<option>MessageContent</option>" + 
            "</select>";
            break;
          default:
            break;
        }
      }
      document.all("propList").innerHTML=sHTML;
      for(var f=0;f<Fields.length;f++){
        var field=Fields[f];
        if (field.default)
        {
          document.all(field.name).value=field.default;
        }
        if (field.title)
        {
          document.all("t_" + field.name).innerHTML=field.title;
        }
      }
      
      parLoad(data);
  }
//#endregion

//#region SAVE & LOAD
var LoadAndSave={
  prepareSave:function(){
    LoadAndSave.removeDataNodes();
    LoadAndSave.saveDiagramProperties();  // do this first, before writing to JSON

    var sDiagram=myDiagram.model.toJson();
    var Flow=LoadAndSave.convertDiagramToBot(sDiagram);
    return {flow:Flow,diagram:JSON.parse(sDiagram)}
  },
  convertDiagramToBot: function(diagram)
  {
      var goObj=JSON.parse(diagram);
      var botObject=[];
      for(var f=0;f<goObj.nodeDataArray.length;f++)
      {
          var gO=goObj.nodeDataArray[f];

          var toLink=[];
          for(var g=0;g<goObj.linkDataArray.length;g++)
          {
              var gL=goObj.linkDataArray[g];
              if (gL.from==gO.key){
                  toLink.push({to:gL.to, text:(gL.text== undefined) ? "" : gL.text});
              }
          }
          botObject.push({ key: gO.key, text: gO.text, type: gO.type, next:toLink, 
                  parVar:gO.parVar, parURL:gO.parURL, parKey:gO.parKey, parTyp:gO.parTyp, parLMI:gO.parLMI,
                  parCon:gO.parCon, parPar:gO.parPar, parCar:gO.parCar, parAPI:gO.parAPI, parAPO:gO.parAPO
              })
      }
      return botObject;
  },
  removeDataNodes:function(){
    //REMOVE DATA NODES
    for (let index = myDiagram.model.nodeDataArray.length-1; index >=0 ; index--) {
      const element = myDiagram.model.nodeDataArray[index];
      if (element.type=="DATASHOW")
        myDiagram.model.removeNodeData(myDiagram.model.nodeDataArray[index]);
    }
  },
  saveDiagramProperties:function() {
    myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
  },
  loadDiagramProperties:function(e) {
    // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
    var pos = myDiagram.model.modelData.position;
    if (pos) myDiagram.initialPosition = go.Point.parse(pos);
  }
}
//#endregion


var Bot={
  messageID:0,
  lastActivity:null,
  key:0,
  sendMessage:function(text, extension){
    Bot.messageID++;
    var message={
      activities:[Object.assign({
      "conversation": {
        "id": "something"
      },
      "id": Bot.messageID,
      "from": {
        "id": "something",
        "name": "someone",
        "role": "bot"
      },
      "recipient": {
        "id": "something",
        "name": "me",
        "role": "user"
      },
      "text": text,
      "timestamp": "2018-10-18T15:21:07.82108Z",
      "type": "message",
      "channelId": "web"
    },extension)]};
    DirectLineEmulator.emptyActivity=message;
  },
  receiveMessage:function(activity){
    if (activity!=Bot.lastActivity){
      console.log("USER ACTIVITY:")
      console.log(activity);
      if (activity.text.toUpperCase().startsWith("BOT:"))
      {
        var message=activity.text.substr(4);

        Bot.key++;
        if (myDiagram.selection.count>0){
          var key=myDiagram.selection.first().key;
          var x=myDiagram.selection.first().part.location.x;
          var y=myDiagram.selection.first().part.location.y;
          y=y+60;
          myDiagram.model.addNodeData({"text":message,"type":"Input", "key": Bot.key, "loc":x + " " + y});
          myDiagram.select(myDiagram.findNodeForKey(Bot.key));
    
          myDiagram.model.addLinkData({ from: key, to: Bot.key });
        }
        else
        {
          if (myDiagram.model.nodeDataArray.length==0)
            myDiagram.model.addNodeData({"text":message,"type":"START", "figure":"Circle","fill":"#00AD5F","key": Bot.key});
          else
            myDiagram.model.addNodeData({"text":message,"type":"Input", "key": Bot.key});
          myDiagram.select(myDiagram.findNodeForKey(Bot.key));
        }
      }
      else
      {
        //MOVE NEXT
        if (myDiagram.selection.count>0){
          var flow=LoadAndSave.prepareSave().flow;
          var condition=false;
          var key=myDiagram.selection.first().key;
          var a=searchArray(flow,key,"key")
  
          var messages=[];
          do {
            condition=false;
            var nxt=Bot.getNext(a.next,activity.text);
            if (nxt)
            {
              var goto=searchArray(flow,nxt,"key")
              messages.push(goto);
              myDiagram.select(myDiagram.findNodeForKey(nxt));

              var a=searchArray(flow,nxt,"key")
              if (a.type=="MESSAGE" || a.type=="START")
                condition=true;
            }
            else
            {
              messages.push({type:"MESSAGE", text:"<end of flow>"});
            }
          } while (condition);
          Bot.sendBotMessage(messages);
        }
        else
        {
          Bot.sendMessage("Design flow and then interact with it");
        }
    }
      Bot.lastActivity=activity;
    }
  },
  getNext:function(nextOptions,message){
    //TODO: evaluate nextOption
    //console.log("LENGTH:" + nextOptions.length);
    if (nextOptions.length<=0)
    {
      return undefined;
    }
    else
      if (nextOptions.length==1)
      {
        return nextOptions[0].to;
      }
      else
      {
        for (let i = 0; i < nextOptions.length; i++) {
          const element = nextOptions[i];

          if (element.text==message) {
            console.log("FOUND:" + element.to);
            return element.to;
          }
        }
      }
  },
  sendBotMessage(flowItems){
    //TODO: render message based on the type
    var activities=[];
    for (let i = 0; i < flowItems.length; i++) {
      const flowItem = flowItems[i];
      
      var extension;
      switch (flowItem.type) {
        case "CHOICE":
          var actions=[];
          flowItem.next.forEach(element => {
            actions.push({title:element.text, type:"imBack", value:element.text});
          });
          extension={"suggestedActions": {"actions":actions}};
          break;
        case "IF":
          var actions=[];
          flowItem.next.forEach(element => {
            actions.push({title:element.text, type:"imBack", value:element.text});
          });
          extension={"suggestedActions": {"actions":actions}};
          break;
        case "LUIS":
          var actions=[];
          flowItem.next.forEach(element => {
            actions.push({title:element.text, type:"imBack", value:element.text});
          });
          extension={"suggestedActions": {"actions":actions}};
          break;
        default:
          break;
      }

      Bot.messageID++;
      activities.push(Object.assign({
        "conversation": {
          "id": "something"
        },
        "id": Bot.messageID,
        "from": {
          "id": "something",
          "name": "someone",
          "role": "bot"
        },
        "recipient": {
          "id": "something",
          "name": "me",
          "role": "user"
        },
        "text": flowItem.text,
        "timestamp": "2018-10-18T15:21:07.82108Z",
        "type": "message",
        "channelId": "web"
      },extension));
    //Bot.sendMessage(flowItem.text, extension);
    var message={activities:activities};
  }
  DirectLineEmulator.emptyActivity=message;
  }
}