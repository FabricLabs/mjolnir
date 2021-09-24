import config from "../../src/config";
import { makeMjolnir, teardownManagementRoom } from "./mjolnirSetupUtils";

// When Mjolnir starts (src/index.ts) it clobbers the config by resolving the management room
// alias specified in the config (config.managementRoom) and overwriting that with the room ID.
// Unfortunately every piece of code importing that config imports the same instance, including
// testing code, which is problematic when we want to create a fresh management room for each test.
// So there is some code in here to "undo" the mutation after we stop Mjolnir syncing.
export const mochaHooks = {
    beforeEach: [
      async function() {
        this.managementRoomAlias = config.managementRoom
        this.mjolnir = await makeMjolnir()
        this.mjolnir.start()
      }
    ],
    afterEach: [
        async function() {
            console.log("stopping mjolnir");
            await this.mjolnir.stop();
            // Mjolnir resolves config.managementRoom and overwrites it, so we undo this here
            // after stopping Mjolnir for the next time we setup a Mjolnir and a management room.
            let managementRoomId = config.managementRoom;
            config.managementRoom = this.managementRoomAlias;
            // remove alias from management room and leave it.
            await teardownManagementRoom(this.mjolnir.client, managementRoomId, this.managementRoomAlias);
        }
    ]
  };
