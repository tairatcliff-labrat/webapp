    var baseUrl = "https://ygjruq551j.execute-api.ap-southeast-2.amazonaws.com/Prod"

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onloadend = function (e) {
                $('#analyzing').show();
                $("#details").hide();
                $("#details").empty();

                var img = document.createElement("img");
                img.src = e.target.result;

                img.onload = function(i) {
                    $('#picture').fadeTo( "fast" , 0.5)

                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    var MAX_WIDTH = 800;
                    var MAX_HEIGHT = 600;
                    var width = img.width;
                    var height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    var dataUrl = canvas.toDataURL("image/jpeg", 0.8);

                    // TODO: Optionally pull this from query string
                    ThingName = "deeplens_zz8BbGbNSVuHCsyqtWOM4Q";

                    // Call register API
                    var params = {
                      ThingName: ThingName,
                      FullName: "Tai Ratcliff", //getVisitor(),
                      Host: "Julian Bright", //getHost(),
                      Image: { Bytes: dataUrl.split("data:image/jpeg;base64,")[1] },
                    }
                    register(params, function(err) {
                      $('#imgPhoto').attr('src', dataUrl);
                      $('#imgPhoto').attr('hidden', false);
                      console.log(err, err.stack);
                      displayDetails(false);
                    }, function(data) {
                      // Rotate image to reflect orientation
                      var rotate = data['OrientationCorrection']
                      $('#imgPhoto').attr('src', dataUrl);
                      $('#imgPhoto').attr('class', 'photo ' + rotate);
                      $('#imgPhoto').attr('hidden', false);
                      // Output details
                      var details = data.FaceDetails[0];
                      var personData = [];
                      personData.push("Age Range: " + details.AgeRange.Low + " - " + details.AgeRange.High );
                      personData.push("Beard: " + details.Beard.Value );
                      personData.push("Eyeglasses: " + details.Eyeglasses.Value );
                      personData.push("Gender: " + details.Gender.Value );
                      personData.push("Smile: " + details.Smile.Value );
                      displayDetails(personData);
                    });
                };

            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    function register(params, failure, success) {
      var url = baseUrl + "/register"
      $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(params),
        contentType: "application/json",
        dataType: "json",
      }).fail(failure).done(success);
    }

    function getAvailableHosts(failure, success) {
      var url = baseUrl + "/hosts"
      $.get(url).fail(failure).done(success);
    }

    function getVisitor() {
      return $("#visitorName").val()
    }

    function getHost() {
      if ($("#hostId").val() != '') {
        return { "Id": $("#hostId").val(), "Name": $("#hostName").val() }
      }
      return null
    }

    function displayDetails(personData){
        $('#picture').fadeTo( "fast" , 1.0)
        $("#analyzing").hide();
        $("#details").show();

        if(personData){
          $("#details").html("");
          $("#details").append("<div style='height:150px; overflow: auto' id='personDetails' class='detailsList'><div class='listHeader'>Person Details:</div></div>");
          displayAnimated($("#personDetails"), personData, 0, 0);
        }
        else{
          $("#details").html("<div style='font-weight: bold'>No recognizable items found.</div>");
        }
    }

    function displayAnimated(divObj, stringList, currWordIndex, currIndex){
        var currWord = stringList[currWordIndex];
        if(currIndex >= currWord.length){
            currIndex = 0;
            currWordIndex += 1;
            if(currWordIndex >= stringList.length){
                return;
            }
            currWord = stringList[currWordIndex];
        }
        if(currIndex == 0 && currWordIndex > 0){
            divObj.append("<br>")
        }
        divObj.append(currWord.charAt(currIndex))
        setTimeout(function(){
            displayAnimated(divObj, stringList, currWordIndex, currIndex+1)
        }, 20);
    }

    $("document").ready(function() {

      getAvailableHosts(function(err) {
        console.log(err, err.stack);
      }, function(res) {
        var availableHosts = res["AvailableHosts"].map(function(item) {
          return { "id": item["RekognitionId"], "label": item["FullName"] }
        })
        $( "#hostName" ).autocomplete({
          source: availableHosts,
          select: function(event, ui) {
            $('#hostId').val(ui.item.id);
          }
        });
      });

      $("#inpObject").on("click", function () {
        if (getVisitor() == '' || getHost() == null) {
          alert('Please provide your name and select host')
          return false;
        }
      });

      $("#inpObject").on("change", function () {
          readURL(this);
      });

    });
