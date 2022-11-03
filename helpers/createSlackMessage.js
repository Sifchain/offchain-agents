module.exports.createSlackMessage = ({ title, summary }) => {
  const fields = Object.keys(summary).map((key) => {
    return {
      type: "mrkdwn",
      text: `*${key}:*\n${summary[key]}`,
    };
  });
  const perChunk = 4;
  const chunkFields = fields.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  const timelong = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(new Date());

  const slackMessage = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Time:*\n${timelong}`,
        },
      },
      ...chunkFields.map((chunk) => ({
        type: "section",
        fields: chunk,
      })),
    ],
  };

  return slackMessage;
};
