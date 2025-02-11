import React from "react"
import {
  Code,
  Box,
  VStack,
  Text,
  Select,
  Button,
  HStack,
  Badge,
  Link,
  Stack,
} from "@chakra-ui/react"
import { ExternalLinkIcon } from "@chakra-ui/icons"
import { ListNumber } from "components/utils/ListNumber"
import { useEffect, useState } from "react"
import {
  getAWSTrafficMirrorLaunchStackURL,
  INGESTOR_AWS_REGIONS,
  getAWSDeployAmiURL,
} from "~/constants"
import SyntaxHighlighter from "react-syntax-highlighter"
import { DocsParams } from "./types"

const KeyStep = ({ num }: { num: number }) => (
  <ListNumber num={num} title="Get AWS API Keys">
    <Text>
      To set up mirroring we need an API Key with the following permissions:
    </Text>
    <Text>- AmazonEC2FullAccess</Text>
    <Text>- AmazonVPCFullAccess</Text>
    <Text>
      You can use the{" "}
      <a href="https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html">
        <Code fontWeight="semibold">aws configure</Code>
      </a>{" "}
      command or{" "}
      <Link
        href="https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html"
        fontWeight="semibold"
        isExternal
      >
        Environment Variables
        <ExternalLinkIcon mx="2px" />
      </Link>{" "}
      to configure AWS.
    </Text>
  </ListNumber>
)
const LOCAL_DOMAINS = ["localhost", "127.0.0.1", "", "::1"]

const AWSDocs: React.FC<DocsParams> = React.memo(({ host, apiKey }) => {
  const [selectedRegion, setSelectedRegion] = useState("")
  const [deployRegion, setDeployRegion] = useState("")
  const [manual, setManual] = useState(false)
  const [metloAddress, setMetloAddress] = useState(null)

  useEffect(() => {
    if (!LOCAL_DOMAINS.includes(window.location.hostname)) {
      setMetloAddress(
        `${window.location.protocol}//${window.location.hostname}:8081`,
      )
    }
  }, [])

  return (
    <VStack spacing={6} w="full">
      <HStack spacing="0" width="full" alignItems="start">
        <Badge
          as="button"
          onClick={() => setManual(false)}
          roundedLeft="md"
          p="1"
          borderWidth="2px 1px 2px 2px"
          colorScheme={manual ? "none" : "gray"}
          opacity={manual ? 0.5 : 1}
          rounded="none"
        >
          One Click Deploy
        </Badge>
        <Badge
          as="button"
          onClick={() => setManual(true)}
          roundedRight="md"
          p="1"
          borderWidth="2px 2px 2px 1px"
          colorScheme={manual ? "gray" : "none"}
          opacity={manual ? 1 : 0.5}
          rounded="none"
        >
          Manual Deploy
        </Badge>
      </HStack>
      <VStack w="full" alignItems="start" spacing="8">
        {manual ? (
          <>
            <ListNumber num={1} title="Deploy an EC2 Instance">
              <Text>
                Be sure your instance has at least <strong>2 Cores</strong> and{" "}
                <strong>4 GB of Ram</strong>.
              </Text>
              <Text>
                Open up port <strong>4789 to UDP Connections</strong> from the
                instances you would like to mirror.
              </Text>
            </ListNumber>
            <ListNumber
              num={2}
              title="Install Metlo's Traffic Mirroring Service"
            >
              <Code w="full" p={2}>
                <SyntaxHighlighter
                  customStyle={{ background: "none", padding: 0 }}
                  language="bash"
                >{`$ sudo mkdir /opt/metlo
$ sudo bash -c "echo 'ENABLE_VXLAN=true' >> /opt/metlo/credentials"
$ sudo bash -c "echo 'METLO_HOST=${host}' >> /opt/metlo/credentials"
$ sudo bash -c "echo 'METLO_KEY=${apiKey}' >> /opt/metlo/credentials"
$ wget https://raw.githubusercontent.com/metlo-labs/metlo-deploy/main/aws/mirroring/install.sh
$ chmod +x install.sh
$ sudo -E ./install.sh`}</SyntaxHighlighter>
              </Code>
            </ListNumber>
            <KeyStep num={3} />
            <ListNumber num={4} title="Install Metlo's CLI Tool">
              <Text>
                You can install metlo from npm by running the following:
              </Text>
              <Code w="full" p={2}>
                <SyntaxHighlighter
                  customStyle={{ background: "none", padding: 0 }}
                  language="bash"
                >{`$ npm i -g @metlo/cli`}</SyntaxHighlighter>
              </Code>
            </ListNumber>
            <ListNumber num={5} title="Set up Traffic Mirroring">
              <Text>To set up traffic mirroring run the following:</Text>
              <Code w="full" p={2}>
                <VStack>
                  <Box w="full">$ metlo traffic-mirror aws new</Box>
                  <Box w="full">✔ Select your AWS region · us-west-2 ✔</Box>
                  <Box w="full">
                    ✔ What type of source do you want to mirror? · instance
                  </Box>
                  <Box w="full">
                    ✔ Enter the id of your source ·i-xxxxxxxxxxxxxxxxx
                  </Box>
                  <Box w="full">Finding Source...</Box>
                  <Box w="full">Success!</Box>
                  <Box w="full">
                    ✔ Enter the id of your Metlo Mirroring Instance: ·
                    i-xxxxxxxxxxxxxxxxx
                  </Box>
                  <Box w="full">Creating Mirror Session</Box>
                  <Box w="full">... Success!</Box>
                </VStack>
              </Code>
            </ListNumber>
          </>
        ) : (
          <>
            <ListNumber
              num={1}
              title="Deploy a Metlo Traffic Mirroring Instance"
            >
              <Text>
                You can use one of our Cloud Formation stacks to deploy in the
                region you would like to mirror.
              </Text>
              <Stack direction={{ base: "column", sm: "row" }}>
                <Select
                  placeholder="Select region"
                  defaultValue={selectedRegion}
                  w="200px"
                  onChange={e => setSelectedRegion(e.target.value)}
                >
                  {INGESTOR_AWS_REGIONS.map(e => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </Select>
                <Button
                  as="a"
                  variant="create"
                  target="_blank"
                  pointerEvents={selectedRegion === "" ? "none" : "initial"}
                  href={getAWSTrafficMirrorLaunchStackURL(
                    selectedRegion,
                    metloAddress,
                    apiKey,
                  )}
                  isDisabled={selectedRegion === ""}
                >
                  Launch Stack
                </Button>
              </Stack>
            </ListNumber>
            <KeyStep num={2} />
            <ListNumber num={3} title="Install Metlo's CLI Tool">
              <Text>
                Once the instance is created, you can start traffic mirroring
                using Metlo&apos;s CLI Tool. You can install metlo from npm by
                running the following:
              </Text>
              <Code w="full" p={2}>
                $ npm i -g @metlo/cli
              </Code>
            </ListNumber>
            <ListNumber num={4} title="Set up Traffic Mirroring">
              <Text>To set up traffic mirroring run the following:</Text>
              <Code w="full" p={2}>
                <VStack>
                  <Box w="full">$ metlo traffic-mirror aws new</Box>
                  <Box w="full">✔ Select your AWS region · us-west-2 ✔</Box>
                  <Box w="full">
                    ✔ What type of source do you want to mirror? · instance
                  </Box>
                  <Box w="full">
                    ✔ Enter the id of your source ·i-xxxxxxxxxxxxxxxxx
                  </Box>
                  <Box w="full">Finding Source...</Box>
                  <Box w="full">Success!</Box>
                  <Box w="full">
                    ✔ Enter the id of your Metlo Mirroring Instance: ·
                    i-xxxxxxxxxxxxxxxxx
                  </Box>
                  <Box w="full">Creating Mirror Session</Box>
                  <Box w="full">... Success!</Box>
                </VStack>
              </Code>
            </ListNumber>
          </>
        )}
      </VStack>
    </VStack>
  )
})

export default AWSDocs
