import { Spinner } from "@/components/ui/spinner";
import { Box } from "@/components/ui/box";

import React from "react";

export default function LoadingScreen() {
    return (
        <Box className="flex-1 justify-center align-center">
            <Spinner size="large" />
        </Box>
    );
}