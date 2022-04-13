import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { GraphQLUpload, Upload } from "graphql-upload";
import Image from "../entities/Image";
import { fileLink, uploadFiles } from "../utils/uploads";
import MyContext from "../utils/context";
import { UserRole } from "../utils";

@Resolver((_type) => Image)
class ImageResolver {
  @Authorized()
  @Mutation(() => [Image])
  async uploadImage(
    @Arg("Image", () => [GraphQLUpload]) images: Upload[],
    @Ctx() { user }: MyContext
  ) {
    try {
      const imagesModel: Image[] = [];
      await Promise.all(
        images.map(async (image: any) => {
          const name = await uploadFiles(image);
          const imageModel = await Image.create({
            name,
            createdBy: user,
          }).save();
          imagesModel.push(imageModel);
        })
      );
      return imagesModel;
    } catch (e) {
      throw new Error(e);
    }
  }

  @Authorized()
  @Query(() => Boolean)
  async deleteImage(
    @Arg("ImageName") name: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const image = await Image.findOneOrFail({ where: { name } });
      if (
        [UserRole.ADMIN, UserRole.DEV].includes(user.role) ||
        user.id === image.createdBy.id
      ) {
        const imageResult = await image.remove();
        return !!imageResult;
      } else throw new Error("Unauthorised");
    } catch (e) {
      throw new Error(e);
    }
  }

  @FieldResolver(() => String)
  async url(@Root() { name }: Image) {
    try {
      return fileLink(name);
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default ImageResolver;
