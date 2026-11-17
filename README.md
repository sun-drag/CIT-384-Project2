# Kiwi the parrot

Open `index.html` in Chrome to play. The included copy of jQuery lets the game run offline. A reload starts a fresh game.

Kiwi starts at 120 g and 68 happiness. Give a cracker to increase weight and happiness, play ball to reduce weight and raise happiness, or let Kiwi nap to raise happiness without changing weight. Exercise immediately increases happiness by 8 and reduces weight by 10 g. Happiness stays between 0 and 100 and weight stays at or above 0.

Kiwi looks happy at 75 or more, curious from 35 to below 75, and sad below 35. Happiness starts draining immediately between interactions at 12 points per minute. Drain pauses while a care animation plays and resumes as soon as it finishes. The game updates every quarter second using elapsed time, and the displayed number rounds upward to a whole point.

The uploaded jungle photograph is stored in `images/jungle.png`. Kiwi sits on a drawn tree branch in front of the photo. The Treat, Play, Exercise, and Rest buttons use local cracker, ball, wing, and yellow moon-and-star illustrations.

## jQuery signup

| Name | Method 1 | Method 2 |
| --- | --- | --- |
| Kiwi the parrot project | [`.find()`](https://api.jquery.com/find/) | [`.data()`](https://api.jquery.com/data/) |

`.find()` locates the four buttons inside the care controls. `.data()` reads the clicked button’s `data-action` value so that one handler can run all four actions. Both documentation links and explanations are next to the calls in `script.js`. The library comes from the [official jQuery CDN](https://code.jquery.com/jquery-3.7.1.min.js).
