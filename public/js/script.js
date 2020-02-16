$(document).ready(function(){
    $('.btn-delete').on('click', function(){
        let id = $(this).data('id')
        console.log(id);
        
        if(confirm('Sure you want Delete?')){
            $.ajax({
                url: '/delete/'+id,
                type: 'DELETE',
                success: function(result){
                    window.location.href="/";
                },
                error: function(err){
                    console.log(err);
                    window.location.href = "/";
                }
            })
        }
    })
})