$(document).ready(function(){
		
	 $('.delete-btn').click(function(e) {
    e.preventDefault();
    var url = $(this).attr('href');
    console.log(url);
    $.ajax({
      url: url,
      method: 'DELETE'
    }).done(function() {
      window.location.href = '/favorites';
    });
  });


	$('ul.nav.navbar-nav li').on('click', function(e){
	    $(this).addClass('active').siblings().removeClass('active');
	});

})