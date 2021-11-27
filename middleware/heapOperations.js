function swap(heap,i,j){
    let temp=heap[i];
    heap[i]=heap[j];
    heap[j]=temp;
}
function heapify(heap,n,i){
    let left=2*i;
    let right=2*i+1;
    let smallest=i;
   
    if(left<n && (heap[smallest].time>heap[left].time)){
      
        smallest=left;
    }

   

    if(right<n && (heap[smallest].time>heap[right].time)){
       
        smallest=right;
    }

    if(smallest!=i){
        swap(heap,i,smallest);
        heapify(heap,n,smallest);
    }
    return;
}

function buildHeap(heap,n){
    for(let i=Math.floor(n/2);i>0;i--){
        heapify(heap,n,i);
    }

}

function insert(heap,val){
    
    heap.push(val)
    let n=heap.length;
    let i=n-1;
    while(i>1){
        
        let par=Math.floor(i/2);
       
       
        if(heap[par].time>heap[i].time){  // if heap par> heap i
            
            swap(heap,i,par);
            i=par;
        }else{
            
            return;
        }
    }
}

function remove(heap){
    let n=heap.length;
    heap[1]=heap[n-1];
    heap.splice(n-1,1);
    heapify(heap,heap.length,1);
    
}

 
// arr=['0','13','3','45','90','012','1'];

// buildHeap(arr,arr.length);
// insert(arr,'30')
// // insert(arr,2)
// // remove(arr)
// remove(arr)
// console.log(arr);
module.exports={
    heapify:heapify,
    buildHeap:buildHeap,
    insert:insert,
    remove:remove
}