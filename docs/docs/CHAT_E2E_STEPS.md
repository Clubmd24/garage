# Chat Feature Manual Test

Follow these steps to verify chat history persistence:

1. Start the dev server with `npm run dev` and open `http://localhost:3000/chat`.
2. In the topic dropdown, create a new topic using the **New topic** field and **Create** button.
3. Type a message in the input box and click **Send**.
4. Refresh the page. The chat should automatically join the previously selected topic and display the message you sent in the history list.

This verifies that topics are created, messages are stored with their `room_id`, and history loads correctly after reloads.
