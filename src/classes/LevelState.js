import {
  LEVEL_THEMES,
  PLACEMENT_TYPE_FLOUR,
  PLACEMENT_TYPE_GOAL,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_WALL,
} from "../helpers/consts";
import { placementFactory } from "./PlacementFactory";
import { GameLoop } from "./GameLoop";
import { DirectionControls } from "./DirectionControls";

export class LevelState {
  constructor(levelId, onEmit) {
    this.id = levelId;
    this.onEmit = onEmit;
    this.directionControls = new DirectionControls();
    //Start the level!
    this.start();
  }

  start() {
    this.theme = LEVEL_THEMES.BLUE;
    this.tilesWidth = 8; //Largeur du niveau en nombre de tuile
    this.tilesHeight = 8;
    this.placements = [
      { id: 0, x: 2, y: 2, type: PLACEMENT_TYPE_HERO },
      { id: 1, x: 6, y: 4, type: PLACEMENT_TYPE_GOAL },
      { id: 2, x: 4, y: 4, type: PLACEMENT_TYPE_WALL },
      { id: 3, x: 5, y: 2, type: PLACEMENT_TYPE_WALL },
      { id: 4, x: 6, y: 6, type: PLACEMENT_TYPE_WALL },
      { id: 5, x: 4, y: 3, type: PLACEMENT_TYPE_FLOUR },
    ].map((config) => {
      return placementFactory.createPlacement(config, this);
    });
    // Cache a reference to the hero
    this.heroRef = this.placements.find((p) => p.type === PLACEMENT_TYPE_HERO);
    this.startGameLoop();
  }

  startGameLoop() {
    this.gameLoop?.stop();
    this.gameLoop = new GameLoop(() => {
      this.tick();
    });
  }

  tick() {
    // Check for movement here...
    if (this.directionControls.direction) {
      this.heroRef.controllerMoveRequested(this.directionControls.direction);
    }
    // Call 'tick' on any Placement that wants to update
    this.placements.forEach((placement) => {
      placement.tick();
    });

    //Emit any changes to React
    this.onEmit(this.getState());
  }

  isPositionOutOfBounds(x, y) {
    return (
      x === 0 ||
      y === 0 ||
      x >= this.tilesWidth + 1 ||
      y >= this.tilesHeight + 1
    );
  }

  getState() {
    return {
      theme: this.theme,
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      placements: this.placements,
    };
  }

  destroy() {
    // Tear down the level.
    this.gameLoop.stop();
    this.directionControls.unbind();
  }
}
