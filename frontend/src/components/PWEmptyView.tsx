import {
  Box,
  Heading,
  VStack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react"
import { HiShieldCheck } from "icons/hi/HiShieldCheck"
import { DataHeading } from "components/utils/Card"

export const PWEmptyView: React.FC<{ name: string }> = ({ name }) => {
  const iconColor = useColorModeValue("rgb(163, 165, 170)", "rgb(98, 100, 116)")
  return (
    <Box
      bg="secondaryBG"
      w="full"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing="4">
        <HiShieldCheck color={iconColor} size="80" />
        <Heading size="2xl" fontWeight="semibold">
            {name}
        </Heading>
        <DataHeading textAlign="center" fontSize="lg" pb="4">
          {name} is a premium feature that requires a license.
        </DataHeading>
        <Button
          variant="create"
          as="a"
          href="https://www.metlo.com/contact"
          target="_blank"
        >
          Contact Us
        </Button>
      </VStack>
    </Box>
  )
}
