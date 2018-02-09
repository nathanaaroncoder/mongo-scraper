$(document).ready(function(){
   
function loadProducts(){
    $.getJSON("/products", function(data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
          var col = $("<div class='col s12 m6'>");
          var card = $("<div class= 'card white product-card'>");
          var cardContent = $("<div class = 'card-content'>");
          var link = $("<a target='_blank'>");
          var cardTitle = $("<span class='card-title'>");
          var productImg = $("<img class='center-align'>");
          var buttonRow = $("<div class='row'>");
          var saveButton = $("<button class='save-button btn blue'>Save This Deal</button>");
    
         
          link.text(data[i].title);
          link.attr("href", "https://www.amazon.com/" + data[i].link);
          productImg.attr("src", data[i].source);
        
          cardTitle.append(link);
          cardContent.prepend(cardTitle);
          cardContent.append(productImg);
          saveButton.attr("data-id", data[i]._id);
          buttonRow.append(saveButton);
          cardContent.append(buttonRow);
          card.append(cardContent);
          card.attr("id", data[i]._id);
          col.append(card);
        
    
          $("#products").append(col); 
        }
    });

}

loadProducts();

$(document).on("click", "#close-scrape", function() {
    $("#products").empty();    
    loadProducts();
});

  
  
  // Whenever someone clicks a note-button
  $(document).on("click", ".note-button", function() {
    // Empty the notes from the modal
    $("#notes-modal-content").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/products/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#notes-modal-content").append("<h4>" + data.title + "</h4>");
        // An input to enter a new title
        $("#notes-modal-content").append("<input id='titleinput' type='email' name='title' class='validate'>");
        // A textarea to add a new note body
        $("#notes-modal-content").append("<textarea id='bodyinput' name='body' type='email' class='validate'></textarea>");
        
        // A button to submit a new note, with the id of the article saved to it
        $("#notes-modal-content").append("<a data-id='" + data._id + "' id='savenote' class='btn modal-action modal-close'>Save Note</a>");
       
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/products/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes-modal-content").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  

  $(document).on("click", "#scraper", function() {
    $.ajax({
        method: "GET",
        url: "/scrape"
      })
        .then(function(data) {
            console.log(data);
        });
  });

  $(document).on("click", ".save-button", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "PUT",
        url: "/products/" + thisId + "/true"
      })
        .then(function(data) {
            console.log(data);
            $("#" + thisId).remove();
        });
  });
  
  $('.modal').modal();

  $(document).on("click", "#saved-deals-link", function() {
      $("#products").empty();

      $.getJSON("/saved", function(data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
          var col = $("<div class='col s12 m6'>");
          var card = $("<div class= 'card white product-card'>");
          var cardContent = $("<div class = 'card-content'>");
          var link = $("<a target='_blank'>");
          var cardTitle = $("<span class='card-title'>");
          var productImg = $("<img class='center-align'>");
          var buttonRow = $("<div class='row'>");          
          var noteButton = $("<button data-target='notes' class='note-button btn modal-trigger'>Write a Note</button>");
          var deleteButton = $("<button class='delete-button btn red'>Delete from Saved</button>");
  
          link.text(data[i].title);
          link.attr("href", "https://www.amazon.com/" + data[i].link);
          productImg.attr("src", data[i].source);
        
          cardTitle.append(link);
          cardContent.prepend(cardTitle);
          cardContent.append(productImg);
          noteButton.attr("data-id", data[i]._id);
          deleteButton.attr("data-id", data[i]._id);          
          buttonRow.append(noteButton);
          buttonRow.append(deleteButton);          
          cardContent.append(buttonRow);
          card.append(cardContent);
          card.attr("id", data[i]._id);
          col.append(card);
    
          $("#products").append(col);
    
    
        }
      });


    });


    $(document).on("click", ".delete-button", function() {
        var thisId = $(this).attr("data-id");
        $.ajax({
            method: "PUT",
            url: "/products/" + thisId + "/false"
          })
            .then(function(data) {
                $("#" + thisId).remove();
                console.log(data);
            });
      });

});
