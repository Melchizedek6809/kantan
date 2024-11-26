# 簡単 Game Engine

Still very buggy, though I'm trying to improve/stabilize it one GameJam at a time.
In order to use this just fork/clone this repo and start coding.

## Why?

### Less Bloat
Most Game Engines I've seen for the Web are massive, weighing in at multiple megabytes makes no sense when modern browsers already provide so much functionality.

### No allocations during rendering
While being fast/performant is nice, what is much more important to me is that there are no stutters/pauses during gameplay. Since these are often caused by the GC it is super important that we don't allocate anything in the engine during normale rendering/gameplay.

### Modern tooling
No reason not to go all in on TypeScript/ESM at this point.

## Limitations / Non-features

### Require WebGL2
Ignore 2D Canvas/WebGL1 contexts entirely, try to make the WebGL2 Renderer as good as possible.

### Only 2D
Only 2D stuff is supported in the engine proper. However there should be escape hatches for developers so they can do their own WebGL calls, mainly because the engine might not support ever grahics feature required for every game. Or maybe a game requires a super optimized renderer, or maybe someone wants to do some 3D effects. Whatever the motivation may be, it is essential that developers can do their own rendering but still use most of the engine.