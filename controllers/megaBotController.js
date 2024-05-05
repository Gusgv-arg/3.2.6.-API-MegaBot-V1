import { processMessageWithOpenAiAssistant } from "../utils/processMessageWithOpenAiAssistant.js";
import { processQuestionWithApi } from "../utils/processQuestionWithApi.js";
import { saveUserQuestionInDb } from "../utils/saveUserQuestionInDb.js";

export const megaBotController = async (req, res) => {
	//Expected object from the user
	const newMessage = req.body.messages;
	console.log("newmessages en megabotcontroller---->", newMessage)

	try {
		// If user asks predefined question
		if (newMessage.question) {
			const id_user = newMessage.id_user;
			//Save user predefined question && answer in DB
			await saveUserQuestionInDb(id_user, newMessage);

			//Process the user question
			const response = processQuestionWithApi(newMessage);
			res
				.status(200)
				.send({ role: "assistant", content: response.answerQuestion });

			// Pass the user non predefinded question to the GPT
		} else {
			const response = await processMessageWithOpenAiAssistant(newMessage);
			console.log("response GPT:", response)
			res
				.status(200)
				.send({
					role: "assistant",
					content: response?.messageGpt
						? response.messageGpt
						: response.errorMessage,
					threadId: response.threadId,
				});
		}
	} catch (error) {
		console.log("Error en megaBotCotroller:", error.message);
		res.status(500).send({ error: error.message });
	}
};
