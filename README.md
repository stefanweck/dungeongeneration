# Random Dungeon Generation V.0.6.3

This project started out as a small project to experiment with random dungeon generation. Quickly I began to notice that this was a lot of fun to work with and I added a player. And I added some enemies. And I rewrote the map generator. I added turns. Etc etc, until we ended up here!
A roguelike game with a random dungeon generator that I am creating purely in javascript on canvas!

_Version: 0.6.3 - Released: 26th May 2014_

By [Stefan Weck](http://www.stefanweck.nl),

- Keep track of the progress on the [Development Blog](http://gamesby.stefanweck.nl/)
- Follow me on [Twitter](https://twitter.com/stefanweck)
- Email me at contact@stefanweck.nl

## Features

![Some Characters](http://stefanweck.nl/github/github_banner_1.png)

**Random Dungeon Generation**

Every playthrough will be different because every single map is different! The map generator tries to create new maps that are worth exploring and that encourage you to clear the entire map.

**Turn Based Combat**

Not only is everything turn based. It is also based on speed. For example, some enemies can act twice while you can only perform one action.

**Component Entity System**

This system allows me to attach components to entities. Examples of components are: Sprite, CanOpen, CanFight or KeyBoardControl. By combining these components and attaching them to entities I can create almost anything. Do you want to control a door with your keyboard or do you want a magic door that is able to fight? It's all possible.

**Fog of War**

You want to know what's on the other side of that wall? Go check it out, you don't have X-ray vision to look through walls. A thick fog of war will hide everything that isn't lit up by your torch, allowing enemies to sneak upon to you. Who know what happens in the dark.

**Configurable Settings**

Currently this only applies to fellow programmers that know their way around the code. But in the future I will let people choose their own settings before they start their playthrough. Ensuring once again a new and fresh experience.

## Demo

![Some Other Characters](http://stefanweck.nl/github/github_banner_2.png)

You can view a live demo with the current code
on GitHub right here: [Live Demo](http://stefanweck.nl/github/dungeongeneration/).
Note: Move the character around with your WASD keys!

## What's Next

**Looting**

One of the more important parts of the game is being able to loot enemies, chests and other piles of garbage! This means the player should have an inventory to store and use all these items.

**Advanced Enemy Behaviour**

For now every enemy is very dumb, they just run to you as soon as they see you. If you manage to lose them they will wait in the dark again until you show up. I want more intelligent monsters that flee when hurt, or that cooperate with other monsters to corner you!

**User Interface**

An user interface that tells the player exactly what is going on. Health bars, fancy buttons, you name it.

**Text Log**

Every classic roguelike has a nice text log telling you exactly what happened. It doesn't need to be very prominent because I want the game itself to be intuitive enough to understand what's going on. But it adds an extra touch to the game.

**Different Types of Rooms**

Every room is now a plain old square. I would like to see some more variation in terms of room layouts. Maybe have some rooms where the floor has collapsed or have rooms that are overgrown with grass.

## How to Build

I provide a fully compiled version of the game in the `dist` folder. Both plain and minified formats are in there.

Open up your console and navigate to the root folder of this project.

Run `grunt` to perform a new build to the `dist` folder. This way every single script found in the `lib` folder gets concatenated and minified.

## Changelog

**V.0.6.3**

- Started with decent version numbering
- Game is now fullscreen
- Seedable random number generator

**V.0.6.0**

- New map generator
- Path finding for enemies
- Major code refactoring
- Added factories to create entities

**V.0.4.0**

- A component entity system
- Turns
- Interaction with objects, such as doors
- Monsters and enemies!

**V.0.2.0**

- Fog of War!
- Field of view for the player

**V.0.1.0**

- A player that can walk through the dungeon
- A camera with a viewport
- Configurable settings

**V.0.0.1**

- Random Dungeon Generation
- Corridors between the rooms
- Random doors at the end of corridors

## Contribute

I would love for the community to help along with this project. It's already getting a decent sized game and chances are that I overlooked something or could improve something!

- If you find an error or problem report it on [GitHub Issues](https://github.com/stefanweck/dungeongeneration/issues)!

- Feel free to fork the repository and propose a pull request!

## Contact

![Some More Characters](http://stefanweck.nl/github/github_banner_3.png)

Do you have great ideas, do you want to contribute or just send 
me an email. You can reach me by emailing to contact@stefanweck.nl!

## License
This project is licensed under the terms of the MIT license, 
found in [LICENSE.md](LICENSE.md)
