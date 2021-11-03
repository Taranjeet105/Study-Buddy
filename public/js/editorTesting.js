const editor = new EditorJS({
    holderId:'editorjs',
   
    tools:{
        paragraph: {
            class: Paragraph,
            inlineToolbar:['bold','italic']
          },
        header:{
            class:Header,
            inlineToolbar:['bold','italic']
        },
        list:{
            class:List,
            inlineToolbar:['bold','italic']
            
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



