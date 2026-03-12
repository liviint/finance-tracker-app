import { useEffect } from "react";
import { Alert, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {checkForUpdate} from "../../../utils/versionCheck"

const DISMISSED_KEY = "dismissed_update_version";

export default function UpdateAppProvider() {
    useEffect(() => {
        const runCheck = async () => {
            const result = await checkForUpdate();
            
            if(!result) return

            const dismissedVersion = await AsyncStorage.getItem(DISMISSED_KEY);
            if (
                result?.force_update &&
                dismissedVersion === result.latest_version
            ) {
                return;
            }
            if (dismissedVersion === result.latest_version) {
                return;
            }

            Alert.alert(
                "Update Available",
                result?.message,
                result?.force_update 
                ? [
                    {
                        text: "Update",
                        onPress: () => Linking.openURL(result.update_url),
                    },
                    ]
                : [
                    {
                        text: "Later",
                        onPress: () =>
                        AsyncStorage.setItem(
                            DISMISSED_KEY,
                            result.latest_version
                        ),
                    },
                    {
                        text: "Update",
                        onPress: () => Linking.openURL(result.update_url),
                    },
                    ]
            );
        };

        // setTimeout(runCheck, 1500);
    }, []);

    return null;
}