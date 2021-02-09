import BaseGenerator from './BaseGenerator';
import { instance as generatorRegistryInstance } from '@civ-clone/core-world-generator/GeneratorRegistry';

generatorRegistryInstance.register(BaseGenerator);
