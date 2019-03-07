# bot conversation designer

## NOTE: IN ACTIVE DEVELOPMENT (Check Implementation Backlog)

Design and debug visually your bot conversations.

Create the Microsoft Bot Framework code (node or c#) automatically from the designer.

Play with it here: https://lambot.blob.core.windows.net/github/botconversationdesigner/index.html

if you want to try some demo flows, when you press load load the url link instead of a local file: 

https://lambot.blob.core.windows.net/github/botconversationdesigner/GreenCard.botdesign 

## Features
- The conversation is synchronized with the visual designer 
![Synchronicity](images/image1.png =300x)
- No need to deploy a bot to use the designer, run it on the browser
- Load and Save bot flows locally
- Add nodes on the flow by drag-n-drop of elements or by typing on the conversation window: **bot:** _your text_
- Jump to any activity and play the conversation from there
![Debug](images/image2.png =300x)
- Use pragmas {_var_} to do IF or show user input 
![Debug](images/image3.png =300x)
- Export the flow to C# or Node 
![Export](images/image4.png =300x)

## Implementation backlog:
- EXPORT TO Node missing features
    - API
    - DIALOG
- EXPORT TO C# missing features: 
    - card
    - LUIS
    - QNA
    - API
    - DIALOG
- (new feature) Enable check if variable is already filled for any activity