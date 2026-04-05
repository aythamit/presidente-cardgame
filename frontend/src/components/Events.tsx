interface EventsProps {
    events: Array<{ [key: string]: unknown }>;
}

export function Events({ events }: EventsProps) {
    return (
        <ul>
            {
                events.map((event, index) =>
                    <li key={ index }>{ JSON.stringify(event) }</li>
                )
            }
        </ul>
    );
}
