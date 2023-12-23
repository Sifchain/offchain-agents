const { getEpochInfos } = require("./getEpochInfos");

const EPOCHS = [
  {
    identifier: "day",
    start_time: "2023-12-05T02:24:24.872271198Z",
    duration: "86400s",
    current_epoch: "19",
    current_epoch_start_time: "2023-12-23T02:24:24.872271198Z",
    epoch_counting_started: true,
    current_epoch_start_height: "15278941",
  },
  {
    identifier: "hour",
    start_time: "2023-12-05T02:24:24.872271198Z",
    duration: "3600s",
    current_epoch: "437",
    current_epoch_start_time: "2023-12-23T06:24:24.872271198Z",
    epoch_counting_started: true,
    current_epoch_start_height: "15281390",
  },
  {
    identifier: "week",
    start_time: "2023-12-05T02:24:24.872271198Z",
    duration: "604800s",
    current_epoch: "3",
    current_epoch_start_time: "2023-12-19T02:24:24.872271198Z",
    epoch_counting_started: true,
    current_epoch_start_height: "15219718",
  },
];
const EPOCHS_OBJ = EPOCHS.reduce(
  (acc, epoch) => ({ ...acc, [epoch.identifier]: epoch }),
  {}
);

test("get epoch infos", async () => {
  const queryClient = {
    epochs: {
      getEpochInfos: jest.fn(() => ({ epochs: EPOCHS })),
    },
  };
  const epochs = await getEpochInfos({ queryClient });
  expect(epochs).toEqual(EPOCHS_OBJ);
});
