/*
 * jQuery Lighthouse 0.1
 * https://github.com/LeinardoSmith/lighthouse
 *
 * Copyright LeinardoSmith
 * Released under the MIT license.
 */

// Set the default config for the plugin
jQuery.fn.lighthouse.config = {
containerSelector: '.lighthouse',
anchorSelector: 'a',
imageSelector: 'img',
childSelector: '.content',
childAnchorSelector: 'a',
childImageSelector: 'img',
closeSelector: '.close',
backgroundSelector: '.background',
duration: 350,
openDuration: null,
closeDuration: null,
secondaryDuration: 200,
contentType: 'image'
}

// The main plugin function accepts user config to override the defaults
jQuery.fn.lighthouse = function(config) {

    // Merge the user config with the defaults
    config = $.extend({}, jQuery.fn.lighthouse.config, config);

    // Set the default open and close duration to the regular duration
    config.openDuration = config.openDuration || config.duration;
    config.closeDuration = config.closeDuration || config.duration;

    return this.each(function() {
        // Preload any images that will be used later on (ie child images)
        $(config.containerSelector).find('a').preload();
        $(config.containerSelector).find('img').preload('src');

        // Add click bind to container
        $(this).on('click', open);
        
        // Add click bind to the future close button
        $(this).on('click', config.closeSelector, close);

        // Needs the container object and the event click
        function open(link) {  
            // Set some current objects
            var container = $(this),
                current = {
                    close: $(container).find(config.closeSelector)[0],
                    background: $(container).find(config.backgroundSelector)[0],
                    container: $(container)[0],
                    anchor: $(container).children(config.anchorSelector)[0],
                    image: $(container).find(config.anchorSelector + ' ' + config.imageSelector)[0],
                    child: $(container).children(config.childSelector)[0],
                    childAnchor: $(container).find(config.childSelector + ' ' + config.childAnchorSelector)[0],
                    childImage: $(container).find(config.childSelector + ' ' + config.childAnchorSelector + ' ' + config.childImageSelector)[0],
                    contentType: $(container).hasClass('image') ? 'image' : ($(container).hasClass('html') ? 'html' : config.contentType)
                };
            
            // If we have not shown something already
            if ($(current.child).is(':hidden') || !$(current.child).length) {

                // If we are looking for an image
                if (current.contentType === 'image') {
                    // Get the href of the anchor tag and the src of the img tag
                    var href = $(current.anchor).prop('href'),
                        src = $(current.image).src;

                    // If the href and the src are not equal
                    if (href !== src) {      
                        // Don't follow the link
                        link.preventDefault();
                        
                        // Get the html of the anchor tag (includes any captions, etc.)
                        var html = $(current.container).html();
                        
                        // Add a container div to the inside of the anchor tag
                        $(current.container).append('<div class="'+config.childSelector.split('.')[1]+'">');
                        
                        // Change the current child to the newly created child div
                        current.child = $(current.container).children(config.childSelector);
                        
                        // Copy original anchor tag html to the inside of the newly created container div
                        $(current.child).html(html).hide();
                        
                        // Set the current child image
                        current.childImage = $(current.child).children(config.childImageSelector);
                        
                        // Set the src of the img in the container div to the href of the original anchor tag
                        $(current.childImage).attr('src', href);
                    }
                }
                else {
                    // Don't follow the link
                    link.preventDefault();
                }

                // Add a background div
                $(current.child).append('<div class="' + config.backgroundSelector.split('.')[1] + '"></div>');
                
                // Set the current background
                current.background = $(current.child).find(config.backgroundSelector);
                
                // Set the background css
                $(current.background).addClass('active', config.secondaryDuration);
                
                
                // Set the child anchor height to be the same height as the thumbnail
                $(current.childAnchor).css({
                    height: parseInt($(current.image).height()),
                    width: parseInt($(current.image).width())
                });
                
                
                // Make the child image fill the child anchor
                $(current.childImage).css({
                    // If the image is not in portrait then find the current height and divide by two
                    marginLeft: $(current.childImage).data('portOrLand') !== 'portrait' ? (parseInt($(current.childAnchor).width()) * $(current.childImage).data('aspectRatio')) / -2 : '0',
                    
                    // If the image is not in landscape then find the current width and divide by two
                    marginTop: $(current.childImage).data('portOrLand') !== 'landscape' ? (parseInt($(current.childAnchor).height()) / $(current.childImage).data('aspectRatio')) / -2 : '0',
                    
                    // If the image is not in portrait then set the left ofset to 50%
                    left: $(current.childImage).data('portOrLand') !== 'portrait' ? '50%' : '0',
                    
                    // If the image is not in landscape then set the left ofset to 50%
                    top: $(current.childImage).data('portOrLand') !== 'landscape' ? '50%' : '0',
                    
                    // If the image is not in landscape then set the width to 100%
                    width: $(current.childImage).data('portOrLand') !== 'landscape' ? '100%' : 'auto',
                    
                    // If the image is not in portrait then set the height to 100%
                    height: $(current.childImage).data('portOrLand') !== 'portrait' ? '100%' : 'auto'
                });
                    
                // Animate the current child with the fancy animation!
                $(current.child).css({
                    // Start from the current size of the original container
                    width: $(current.container).width(),
                    height: $(current.container).height(),
                    
                    // Start from the position of the original container
                    left: $(current.container).offset().left,
                    top: $(current.container).offset().top
                }).fadeIn(config.secondaryDuration).animate({
                    width: '100%',
                    height: '100%',
                    left: '0',
                    top: '0',
                    duration: config.openDuration,
                    
                    // Do this animation immediately
                    queue: false
                }).addClass('active', config.secondaryDuration);
                
                // Add the close anchor tag
                $(current.child).append('<a href="#" class="' + config.closeSelector.replace(/^\./, "") + '">X</a>');

                // Update the close object
                current.close = $(current.child).find(config.closeSelector);

                // Fade in the close button
                $(current.close).addClass('active', config.secondaryDuration);
            }
        }

        // Needs the close object and the event click
        function close(link) {
            // Set some current objects
            var container = $(this).parents(config.containerSelector)[0],
                current = {
                    close: $(container).find(config.closeSelector)[0],
                    background: $(container).find(config.backgroundSelector)[0],
                    container: $(container)[0],
                    anchor: $(container).children(config.anchorSelector)[0],
                    image: $(container).find(config.anchorSelector + ' ' + config.imageSelector)[0],
                    child: $(container).children(config.childSelector)[0],
                    childAnchor: $(container).find(config.childSelector + ' ' + config.childAnchorSelector)[0],
                    childImage: $(container).find(config.childSelector + ' ' + config.childAnchorSelector + ' ' + config.childImageSelector)[0],
                    contentType: $(container).hasClass('image') ? 'image' : ($(container).hasClass('html') ? 'html' : config.contentType)
                };
            
            // If something has been shown already
            if (!$(current.child).is(':hidden') || $(current.child).length) {
                // Don't follow the link
                link.preventDefault();

                // Make the close button and the background div disapear and remove them
                $(current.close).removeClass('active', config.secondaryDuration).remove();
                $(current.background).removeClass('active').remove();

                // Close out the current child with the fancy animation
                $(current.child).removeClass('active', config.secondaryDuration).fadeOut({
                    duration: config.closeDuration,
                    
                    // Do this animation immediately
                    queue: false
                }).animate({
                    // Shrink back to the original height of the container
                    height: $(current.container).height(),
                    width: $(current.container).width(),
                    
                    // Shrink back to the original position of the container
                    top: $(current.container).offset().top,
                    left: $(current.container).offset().left,
                    duration: config.closeDuration,
                    
                    /// Do this animation immediately
                    queue: false
                }, function() {
                    // If the content is an image remove the dynamic child
                    if (current.contentType === 'image') {
                        $(current.child).remove();
                    }
                });
            }
        }
    });
}


// Preload the images and store some meta data using the specified attribute (default: href) and return a callback
jQuery.fn.preload = function (attr, callback) {
    // Capture the current element and set the default attribute to href
    var elements = $(this),
        attr = attr || 'href';

    // Cycle through each of the elements
    $(elements).each(function () {
        // Capture the current element
        var element = $(this);
        
        // Create a new test image
        var img = new Image();
        
        // Set the test image src to whatever link/src is provided
        img.src = $(this).prop(attr);
        
        // Wait until the test image is loaded
        $(img).load(function() {
            // The aspect ration is width / height
            var aspectRatio = img.width / img.height;
            
            // If the width is greater than the height then it is landscape (otherwise set the default to landscape)
            var portOrLand = aspectRatio > 1 ? 'landscape' : 'landscape';
            
            // If the height is greater than the width then it is portrait
            portOrLand = aspectRatio < 1 ? 'portrait' : portOrLand;
            
            // If the height is equal to the width then it is square
            portOrLand = aspectRatio == 1 ? 'square' : portOrLand;
            
            // Store the port or land value for use later
            $(element).data('portOrLand', portOrLand);
            
            // Store the original height and width for use later
            $(element).data('width', img.width);
            $(element).data('height', img.height);
            
            // Store the aspect ratio for use later
            $(element).data('aspectRatio', aspectRatio);
        });
    }, function() {
        // Make sure the callback is a function
        if (typeof callback === 'function') {
            // Send the current scope to the callback function
            callback.call(this);
        }
    });
}
