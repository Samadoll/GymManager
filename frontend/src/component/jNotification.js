import {toaster} from "evergreen-ui";

const settings = {
    id: 'forbidden-action'
}

class JNotification {

    static notify(message) {
        toaster.notify(message, settings)
    }

    static success(message) {
        toaster.success(message, settings)
    }

    static danger(message) {
        toaster.danger(message, settings)
    }
}

export default JNotification
