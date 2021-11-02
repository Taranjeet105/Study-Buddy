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
             
    }
    
});



