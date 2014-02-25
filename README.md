## Usage
lister.js is a modification of <a href="https://github.com/bradbirdsall/Swipe" alt="_blank">Swipe</a> follows a similar patterns as Swipe. Here is an example:

``` html
<div class='swipe'>
  <div class='swipe-wrap'>
    <div class="options left fn-reveal">
        <div class="option"></div>
        <div class="option"></div>
    </div>
    <div class="row"></div>
    <div class="options right fn-toggle">
        <div class="option"></div>
    </div>
  </div>
</div>
```

This creates a list item with the option to swipe both left and right to reveal or toggle different functions.

Either .options div can be left out, so it is no problem using just one.

``` js
To initiate the swipable list items:

var swipes = []
$('.swipe').each(function(i, obj) {
    swipes[i] = new Swipe(obj, {
        startSlide: 1
    });
});
```

These styles are necessary for the swiping to work so make sureto add these to your stylesheet:

``` css
.swipe {
  overflow: hidden;
  visibility: hidden;
  position: relative;
}
.swipe-wrap {
  overflow: hidden;
  position: relative;
}
.swipe-wrap > div {
  float:left;
  width:100%;
  position: relative;
}
```

## Config Options

To define what an .options div should behave like there are two classes that you can add to the .options classes:

- fn-toggle
- fn-reveal

lister.js uses these class names to identify what to do with them.

Exmaples:

<div class="options left fn-reveal">...</div>
<div class="options left fn-toggle">...</div>



### Example

``` js

window.mySwipe = new Swipe(document.getElementById('slider'), {
  startSlide: 2,
  speed: 400,
  auto: 3000,
  continuous: true,
  disableScroll: false,
  stopPropagation: false,
  callback: function(index, elem) {},
  transitionEnd: function(index, elem) {}
});

```


## Browser Support
lister.js is an early stage, I have developed and tested it using WebKit based browsers and I cannot give any comments regarding Firefox support.


## Thanks to Brad for making Swipe! The best swiping framework I have come across.

Be sure to check out his work <a href="https://github.com/bradbirdsall/" target="_blank">here</a>.

## License
Licensed under the [The MIT License (MIT)](http://opensource.org/licenses/MIT).
