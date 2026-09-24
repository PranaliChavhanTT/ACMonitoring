import { useEffect, useState } from "react";

// import { a
import { aggregateByMinute } from "../minuteAggregations"

export const useMinuteData = (
    data = [],
    fields = []
) => {

    const [minuteData, setMinuteData] =
        useState([]);


    useEffect(() => {

        const updateMinuteData = () => {

            const aggregated =
                aggregateByMinute(
                    data,
                    fields
                );


            /*
             * Don't include the currently
             * running minute.
             *
             * Example:
             *
             * Current time = 10:25:35
             *
             * 10:25 is still collecting data.
             *
             * So chart displays only:
             *
             * 10:24
             * and earlier.
             */

            const now =
                new Date();

            now.setSeconds(0, 0);


            const completedMinutes =
                aggregated.filter(item => {

                    const itemTime =
                        new Date(
                            item.timestamp
                        );

                    return itemTime < now;

                });


            setMinuteData(
                completedMinutes
            );
        };


        // Initial calculation
        updateMinuteData();


        /*
         * Check once every 60 seconds.
         */
        const interval =
            setInterval(
                updateMinuteData,
                60000
            );


        return () => {
            clearInterval(interval);
        };

    }, [data, fields]);


    return minuteData;
};