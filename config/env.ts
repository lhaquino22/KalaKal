import * as z from 'zod'

interface EnvVariables {
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?: string
    EXPO_PUBLIC_API_URL?: string
    EXPO_PUBLIC_API_KEY?: string
}

const createEnv = () => {
    const EnvSchema = z.object({
        EXPO_PUBLIC_API_URL: z.string().url({
            message: 'A variável EXPO_PUBLIC_API_URL deve ser uma URL válida.',
        }),
        EXPO_PUBLIC_API_KEY: z.string().min(1, {
            message: 'A variável EXPO_PUBLIC_API_KEY é obrigatória.',
        }),
        EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional().default(''),
    })

    const envVars: EnvVariables = {
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY,
        EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    }

    const parsedEnv = EnvSchema.safeParse(envVars)

    if (!parsedEnv.success) {
        console.error(
            `[ENV] Configuração de ambiente inválida:\n${Object.entries(parsedEnv.error.flatten().fieldErrors)
                .map(([key, errors]) => `- ${key}: ${errors.join(', ')}`)
                .join('\n')}`
        )
        // Retornar valores mínimos para evitar crash na inicialização
        return {
            EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || '',
            EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY || '',
            EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        }
    }

    return parsedEnv.data
}
const env = createEnv()
export default env