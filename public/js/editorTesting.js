const editor = new EditorJS({
    holderId:'editorjs',
    tools:{
        header:{
            class:Header,
            inlineToolbar:['link']
        },
        list:{
            class:List,
            inlineToolbar:['link','bold']
            
        },
        embed:{
            class:Embed,
            inlineToolbar:false,
            config:{
                services:{
                    youtube:true,
                    coub:true,
                }
            }
        },
        delimiter: Delimiter,
        
        image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: 'http://localhost:3000/uploadFile', // Your backend file uploader endpoint
                byUrl: 'http://localhost:3000/fetchUrl', // Your endpoint that provides uploading by Url
              }
            }
          }     
    }
    
});



