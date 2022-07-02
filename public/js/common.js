$("#postTextarea, #replyTextarea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var isModal = textbox.parents(".modal").length == 1;

    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if(value == ""){
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#submitPostButton").click(()=>{
    var button = $(event.target);
    var textbox = $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    $.post("/api/posts", data, (postData) =>{
        var html = createPostHtml(postData);
        $(".postsContainer").prepend(html);
        textbox.val("");
        button.prop("disabled", true); //disable the button
    })
})

$("#replyModal").on("show.bs.modal", (event) =>{
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);

    $.get("/api/posts/" + postId, results =>{
        outputPosts(results, $("originalPostContainer"));
    })
})

$(document).on("click", ".likeButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined){return;}

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            
            button.find("span").text(postData.likes.length || "");

            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active");
            }
            else{
                button.removeClass("active");
            }
        }
    })
})

$(document).on("click", ".retweetButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);

    if(postId === undefined){return;}

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {            
            button.find("span").text(postData.retweetUsers.length || "");

            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active");
            }
            else{
                button.removeClass("active");
            } 
        }
    })
})

function getPostIdFromElement(element){
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData){

    if(postData == null) return alert("Post object is null");

    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;

    var postedBy = postData.postedBy;

    if(postedBy._id === undefined){
        return console.log("User object not populated.");
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";

    var retweetText = '';
    if(isRetweet){
        retweetText = `<span>
                        <i class="fa-solid fa-retweet"></i>
                        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                    </span>`
    }

    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        
                        <div class='postFooter'>
                            <div class='postButtonContainer'> 
                                <button data-bs-toggle='modal' data-bs-target='#replyModal'>
                                    <i class="fa-solid fa-comment"></i>
                                </button>
                            </div>

                            <div class='postButtonContainer green'> 
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class="fa-solid fa-retweet"></i>
                                    <span> ${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>

                            <div class='postButtonContainer red'> 
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class="fa-solid fa-heart"></i>
                                    <span> ${postData.likes.length || ""}</span>
                                </button>
                            </div>                            
                        </div>
                    </div>    
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed / 1000 < 30) return 'Just now';
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container) {
    container.html("");    

    if(!Array.isArray(results)) {
        results = [results];
    }

    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    });

    if(results.length == 0){
        container.append("<span class='noResults'> Nothing to Show.</span>")
    }

}